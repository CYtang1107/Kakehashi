import 'dotenv/config';
import os from 'node:os';
import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { DECISIONS, type Decision, type HandoverStage, type HomeBundle, type Item, type Payment, type PublicTag } from '@kakehashi/shared';
import { db, findHome, findItem, findTag, reset, save, saveUpload, UPLOAD_DIR } from './db';
import { plans } from './seed';
import { aiEnabled, estimateWithClaude, offlineEstimate } from './estimate';
import { createCheckout, paymentsMode, readCheckout } from './payments';

const PORT = Number(process.env.PORT ?? 4100);
const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/files', express.static(UPLOAD_DIR, { maxAge: '1h' }));

const now = () => new Date().toISOString();
const id = (p: string) => `${p}-${crypto.randomBytes(4).toString('hex')}`;
const STAGES: HandoverStage[] = ['home', 'sorted', 'repair', 'delivered', 'recycler', 'collected'];

function fail(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

// Half of the estimated resale value of items passed on goes back to the family's bill.
function resaleCredit(homeId: string) {
  const sum = db.items
    .filter((i) => i.homeId === homeId && i.decision === 'pass' && i.estimate)
    .reduce((t, i) => t + (i.estimate!.priceLowJpy + i.estimate!.priceHighJpy) / 2, 0);
  return Math.round((sum * 0.5) / 100) * 100;
}

function bundle(homeId: string): HomeBundle | null {
  const home = findHome(homeId);
  if (!home) return null;
  return {
    home,
    items: db.items.filter((i) => i.homeId === homeId),
    plans,
    resaleCreditJpy: resaleCredit(homeId),
    services: { ai: aiEnabled() ? 'claude' : 'offline', payments: paymentsMode() },
  };
}

function publicTag(item: Item): PublicTag {
  const home = findHome(item.homeId);
  const first = home?.seniorName.split(' ')[0] ?? 'A neighbour';
  return {
    code: item.tagCode!, name: item.name, nameJa: item.nameJa, year: item.year, glyph: item.glyph,
    story: item.story, audioUrl: item.audioUrl, photoUrl: item.photoUrl,
    from: `${first}, ${home?.town ?? ''}`.replace(/, $/, ''),
    journey: item.journey, thanksCount: item.thanks.length,
  };
}

const baseUrl = (req: Request) => `${req.protocol}://${req.get('host')}`;

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: aiEnabled() ? 'claude' : 'offline', payments: paymentsMode() }));

app.get('/api/home/:id', (req, res) => {
  const b = bundle(req.params.id);
  if (!b) return fail(res, 404, 'Home not found.');
  res.json(b);
});

app.post('/api/home/:id/consent', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  home.consent = { recording: Boolean(req.body?.recording), at: now() };
  save();
  res.json(home.consent);
});

app.post('/api/items', (req, res) => {
  const { homeId, roomId, name, nameJa, photo, estimate } = req.body ?? {};
  const home = findHome(homeId);
  if (!home) return fail(res, 404, 'Home not found.');
  const room = home.rooms.find((r) => r.id === roomId);
  if (!room) return fail(res, 400, 'Choose a room for this item.');
  if (!name || typeof name !== 'string') return fail(res, 400, 'Give the item a name.');
  const itemId = id('item');
  const item: Item = {
    id: itemId, homeId, roomId, name: name.trim().slice(0, 80), nameJa: nameJa?.trim() || undefined,
    glyph: name.trim().slice(0, 1).toUpperCase(), decision: 'open', estimate,
    x: Math.round(room.x + 16 + Math.random() * (room.w - 32)),
    y: Math.round(room.y + 24 + Math.random() * (room.h - 40)),
    journey: [{ at: now(), stage: 'home', by: home.seniorName, note: 'Logged on a visit' }],
    thanks: [],
  };
  if (photo?.base64) item.photoUrl = saveUpload(itemId, photo.base64, photo.mime ?? 'image/jpeg');
  db.items.push(item);
  save();
  res.status(201).json(item);
});

app.patch('/api/items/:id', (req, res) => {
  const item = findItem(req.params.id);
  if (!item) return fail(res, 404, 'Item not found.');
  const { decision, story } = req.body ?? {};
  if (decision !== undefined) {
    if (![...DECISIONS, 'open'].includes(decision)) return fail(res, 400, 'Unknown decision.');
    if (item.decision !== decision && decision !== 'open') {
      item.journey.push({ at: now(), stage: 'sorted', by: 'Students, with the senior', note: `Decision: ${decision}` });
    }
    item.decision = decision as Decision;
  }
  if (typeof story === 'string') item.story = story.slice(0, 2000);
  save();
  res.json(item);
});

app.post('/api/items/:id/suggest', (req, res) => {
  const item = findItem(req.params.id);
  if (!item) return fail(res, 404, 'Item not found.');
  const s = req.body?.suggestion;
  if (!DECISIONS.includes(s)) return fail(res, 400, 'Unknown suggestion.');
  item.suggestion = s;
  save();
  res.json(item);
});

app.post('/api/items/:id/audio', (req, res) => {
  const item = findItem(req.params.id);
  if (!item) return fail(res, 404, 'Item not found.');
  const home = findHome(item.homeId);
  if (!home?.consent.recording) return fail(res, 403, 'Recording consent is needed before saving a story recording.');
  const { base64, mime } = req.body ?? {};
  if (!base64) return fail(res, 400, 'No recording received.');
  item.audioUrl = saveUpload(`${item.id}-story`, base64, mime ?? 'audio/m4a');
  save();
  res.json(item);
});

app.post('/api/items/:id/tag', (req, res) => {
  const item = findItem(req.params.id);
  if (!item) return fail(res, 404, 'Item not found.');
  if (!item.tagCode) {
    item.tagCode = `KK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    save();
  }
  res.json(item);
});

app.post('/api/items/:id/handover', (req, res) => {
  const item = findItem(req.params.id);
  if (!item) return fail(res, 404, 'Item not found.');
  const { stage, by, note } = req.body ?? {};
  if (!STAGES.includes(stage)) return fail(res, 400, 'Unknown handover stage.');
  if (!by) return fail(res, 400, 'Say who received the item.');
  item.journey.push({ at: now(), stage, by: String(by).slice(0, 80), note: note ? String(note).slice(0, 200) : undefined });
  save();
  res.json(item);
});

app.post('/api/estimate', async (req, res) => {
  const { base64, mime, name } = req.body ?? {};
  if (!aiEnabled() || !base64) return res.json(offlineEstimate(name));
  try {
    res.json(await estimateWithClaude(base64, mime ?? 'image/jpeg', name));
  } catch (err) {
    console.warn('AI estimate failed, using offline estimate:', err instanceof Error ? err.message : err);
    res.json({ ...offlineEstimate(name), reason: 'The AI estimate was unavailable, so this is a rough rule-based estimate.' });
  }
});

app.get('/api/tags/:code', (req, res) => {
  const item = findTag(req.params.code);
  if (!item) return fail(res, 404, 'No story tag with this code.');
  res.json(publicTag(item));
});

app.post('/api/tags/:code/thanks', (req, res) => {
  const item = findTag(req.params.code);
  if (!item) return fail(res, 404, 'No story tag with this code.');
  const { from, message } = req.body ?? {};
  if (!message || !String(message).trim()) return fail(res, 400, 'Write a message first.');
  item.thanks.push({ from: String(from || 'New owner').slice(0, 40), message: String(message).slice(0, 500), at: now() });
  save();
  res.status(201).json(publicTag(item));
});

app.post('/api/checkout', async (req, res) => {
  const { homeId, planId } = req.body ?? {};
  const home = findHome(homeId);
  const plan = plans.find((p) => p.id === planId);
  if (!home || !plan) return fail(res, 400, 'Choose a plan.');
  const credit = Math.min(resaleCredit(homeId), plan.priceJpy - 1000);
  const amount = plan.priceJpy - credit;
  home.planId = plan.id;
  if (paymentsMode() === 'demo') {
    const payment: Payment = { id: id('pay'), planId: plan.id, amountJpy: amount, resaleCreditJpy: credit, status: 'paid', mode: 'demo', at: now() };
    home.payments.unshift(payment);
    save();
    return res.json({ mode: 'demo', payment });
  }
  try {
    const url = await createCheckout({ amountJpy: amount, planName: plan.name, homeId, planId: plan.id, resaleCreditJpy: credit, baseUrl: baseUrl(req) });
    save();
    res.json({ mode: 'stripe-test', url });
  } catch (err) {
    fail(res, 502, `Stripe test checkout failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
});

const page = (title: string, body: string) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<body style="font-family:system-ui,sans-serif;max-width:420px;margin:15vh auto;padding:0 20px;color:#1d2433"><h1 style="font-size:22px">${title}</h1><p>${body}</p></body>`;

app.get('/payment/success', async (req, res) => {
  const sessionId = String(req.query.session_id ?? '');
  try {
    const s = await readCheckout(sessionId);
    const home = findHome(s.homeId);
    if (s.paid && home && !home.payments.some((p) => p.id === sessionId)) {
      home.payments.unshift({ id: sessionId, planId: s.planId, amountJpy: s.amountJpy, resaleCreditJpy: s.resaleCreditJpy, status: 'paid', mode: 'stripe-test', at: now() });
      save();
    }
    res.send(page(s.paid ? 'Payment complete (test mode)' : 'Payment not completed', s.paid ? 'No real money was charged. You can close this page and return to the app.' : 'Return to the app and try again.'));
  } catch {
    res.status(400).send(page('Could not check this payment', 'Return to the app and try again.'));
  }
});

app.get('/payment/cancel', (_req, res) => res.send(page('Payment cancelled', 'Nothing was charged. You can close this page and return to the app.')));

app.post('/api/reset', (_req, res) => {
  reset();
  res.json({ ok: true });
});

function lanIp() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list ?? []) if (a.family === 'IPv4' && !a.internal) return a.address;
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KAKEHASHI server  http://${lanIp()}:${PORT}`);
  console.log(`AI estimates: ${aiEnabled() ? 'Claude' : 'offline (set ANTHROPIC_API_KEY to enable)'}`);
  console.log(`Payments: ${paymentsMode() === 'stripe-test' ? 'Stripe test mode' : 'demo mode (set a sk_test_ key to enable Stripe)'}`);
});
