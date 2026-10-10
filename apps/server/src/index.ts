import 'dotenv/config';
import os from 'node:os';
import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { CHOICES, HELP_KINDS, SERVICE_CATALOG, isCleared, fixCost, type ServiceKind, CONDITION_PARTS, FIX_KINDS, HOUSE_STEPS, HOUSE_WISHES, type ConditionPart, type HouseStep, READINESS, WISHES, type ActivityStatus, type ReadinessStep, type Decision, type HandoverStage, type HomeBundle, type Item, type Payment, type PublicStory, type PublicTag } from '@kakehashi/shared';
import { db, findHome, findItem, findTag, reset, save, saveUpload, UPLOAD_DIR } from './db';
import { plans } from './seed';
import { aiEnabled, estimateWithClaude, offlineEstimate } from './estimate';
import { createCheckout, paymentsMode, readCheckout } from './payments';
import { checkReport } from './pressure';
import { mapPage } from './mapPage';

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

// Resale money belongs to the senior. It never reduces the family's fee,
// so nobody gains from her letting things go.
function seniorProceeds(homeId: string) {
  return db.items.filter((i) => i.homeId === homeId).reduce((t, i) => t + (i.proceedsJpy ?? 0), 0);
}

// Items she agrees to let go stay home until the next planned visit, so she can change her mind.
function nextVisitDate(homeId: string) {
  const home = findHome(homeId);
  const today = new Date().toISOString().slice(0, 10);
  return home?.visits.filter((v) => v.status === 'planned' && v.date >= today).map((v) => v.date).sort()[0];
}

function bundle(homeId: string): HomeBundle | null {
  const home = findHome(homeId);
  if (!home) return null;
  return {
    home,
    items: db.items.filter((i) => i.homeId === homeId),
    plans,
    seniorProceedsJpy: seniorProceeds(homeId),
    services: { ai: aiEnabled() ? 'claude' : 'offline', payments: paymentsMode() },
  };
}

function publicTag(item: Item): PublicTag {
  const home = findHome(item.homeId);
  const first = home?.seniorName.split(' ')[0] ?? 'A neighbour';
  return {
    code: item.tagCode!, name: item.name, nameJa: item.nameJa, year: item.year, glyph: item.glyph,
    story: item.story, storyJa: item.storyJa, audioUrl: item.audioUrl, photoUrl: item.photoUrl,
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

app.post('/api/home/:id/proceeds', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const choice = req.body?.choice;
  if (!['keep', 'grandchild', 'donate'].includes(choice)) return fail(res, 400, 'Unknown choice.');
  home.proceedsChoice = choice;
  save();
  res.json({ proceedsChoice: choice });
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
    if (!CHOICES.includes(decision)) return fail(res, 400, 'Unknown decision.');
    const leaving = decision === 'pass' || decision === 'recycle' || decision === 'family';
    const alreadyLeft = item.journey.some((j) => j.stage !== 'home' && j.stage !== 'sorted');
    if (item.decision !== decision && decision !== 'open') {
      item.journey.push({ at: now(), stage: 'sorted', by: 'Her decision, with the students', note: `Decision: ${decision}` });
    }
    item.holdUntil = leaving && !alreadyLeft ? nextVisitDate(item.homeId) : undefined;
    item.decision = decision as Decision;
  }
  if (typeof story === 'string') { item.story = story.slice(0, 2000); delete item.storyJa; } // a new story replaces the old translation
  save();
  res.json(item);
});

// The family far away can share a wish about an item. It is shown to her; it is never a vote.
app.post('/api/items/:id/wish', (req, res) => {
  const item = findItem(req.params.id);
  if (!item) return fail(res, 404, 'Item not found.');
  const { kind, note } = req.body ?? {};
  if (!WISHES.includes(kind)) return fail(res, 400, 'Unknown wish.');
  const home = findHome(item.homeId);
  item.wish = { kind, from: home?.childName ?? 'Family', note: note ? String(note).slice(0, 300) : undefined, at: now() };
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
  const today = new Date().toISOString().slice(0, 10);
  if (item.holdUntil && today < item.holdUntil) return fail(res, 409, `This item stays at home until ${item.holdUntil}, in case she changes her mind.`);
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
  const amount = plan.priceJpy;
  home.planId = plan.id;
  if (paymentsMode() === 'demo') {
    const payment: Payment = { id: id('pay'), planId: plan.id, amountJpy: amount, status: 'paid', mode: 'demo', at: now() };
    home.payments.unshift(payment);
    save();
    return res.json({ mode: 'demo', payment });
  }
  try {
    const url = await createCheckout({ amountJpy: amount, planName: plan.name, homeId, planId: plan.id, baseUrl: baseUrl(req) });
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
      home.payments.unshift({ id: sessionId, planId: s.planId, amountJpy: s.amountJpy, status: 'paid', mode: 'stripe-test', at: now() });
      save();
    }
    res.send(page(s.paid ? 'Payment complete (test mode)' : 'Payment not completed', s.paid ? 'No real money was charged. You can close this page and return to the app.' : 'Return to the app and try again.'));
  } catch {
    res.status(400).send(page('Could not check this payment', 'Return to the app and try again.'));
  }
});

app.get('/payment/cancel', (_req, res) => res.send(page('Payment cancelled', 'Nothing was charged. You can close this page and return to the app.')));

// ---------- Safer home plan: small modifications she agrees to ----------

app.post('/api/home/:id/safety', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const { roomId, kind, amount, note } = req.body ?? {};
  const room = home.rooms.find((r) => r.id === roomId);
  if (!room) return fail(res, 400, 'Choose a room.');
  if (!FIX_KINDS.includes(kind)) return fail(res, 400, 'Choose a kind of fix.');
  const qty = Number(amount);
  if (!(qty > 0 && qty <= 50)) return fail(res, 400, 'Enter a length, count or area between 0 and 50.');
  // Place the marker inside the room, spread out so markers do not stack.
  const n = home.safety.filter((f) => f.roomId === room.id).length;
  home.safety.push({
    id: id('fix'), roomId: room.id, kind, amount: Math.round(qty * 10) / 10, status: 'suggested',
    note: note ? String(note).slice(0, 300) : undefined,
    x: Math.round(room.x + 20 + ((n * 37) % Math.max(1, room.w - 40))),
    y: Math.round(room.y + room.h - 20 - ((n * 23) % Math.max(1, room.h - 40))),
  });
  save();
  res.status(201).json(home.safety);
});

app.post('/api/home/:id/safety/:fid', (req, res) => {
  const home = findHome(req.params.id);
  const fix = home?.safety.find((f) => f.id === req.params.fid);
  if (!home || !fix) return fail(res, 404, 'Fix not found.');
  const status = req.body?.status;
  if (!['suggested', 'agreed', 'not-now', 'done'].includes(status)) return fail(res, 400, 'Unknown status.');
  fix.status = status;
  save();
  res.json(home.safety);
});

// ---------- The house's future (家のこれから): her wish, family notes, condition, steps ----------

app.post('/api/home/:id/future/wish', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const { wish, words, by } = req.body ?? {};
  if (!HOUSE_WISHES.includes(wish)) return fail(res, 400, 'Choose her wish, or "not decided".');
  Object.assign(home.future, { wish, words: words ? String(words).trim().slice(0, 400) : undefined, wordsJa: undefined, recordedBy: String(by || 'Student').slice(0, 40), recordedAt: now().slice(0, 10) });
  save();
  res.json(home.future);
});

app.post('/api/home/:id/future/note', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const note = String(req.body?.note ?? '').trim();
  if (!note) return fail(res, 400, 'Write your note first.');
  home.future.familyNotes.push({ by: String(req.body?.by || home.childName).slice(0, 40), note: note.slice(0, 400), at: now().slice(0, 10) });
  save();
  res.status(201).json(home.future);
});

app.post('/api/home/:id/future/condition', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const { part, level, note } = req.body ?? {};
  if (!CONDITION_PARTS.includes(part)) return fail(res, 400, 'Choose a part of the house.');
  if (!['ok', 'watch', 'repair'].includes(level)) return fail(res, 400, 'Choose OK, keep an eye on it, or needs repair.');
  home.future.condition[part as ConditionPart] = { level, note: note ? String(note).trim().slice(0, 200) : undefined, at: now().slice(0, 10) };
  save();
  res.json(home.future);
});

app.post('/api/home/:id/future/step', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const { step, done } = req.body ?? {};
  if (!HOUSE_STEPS.includes(step)) return fail(res, 400, 'Unknown step.');
  if (done) home.future.steps[step as HouseStep] = now().slice(0, 10);
  else delete home.future.steps[step as HouseStep];
  save();
  res.json(home.future);
});

// ---------- Neighbourhood map page (shown in an iframe or WebView) ----------

app.get('/map/:homeId', (req, res) => {
  const home = findHome(req.params.homeId);
  if (!home) return res.status(404).send('Home not found.');
  res.type('html').send(mapPage(home, req.query.lang === 'ja' ? 'ja' : 'en'));
});

// ---------- Public story feed: only stories she agreed to share ----------

function publicStory(item: Item): PublicStory {
  const home = findHome(item.homeId);
  const first = home?.seniorName.split(' ')[0] ?? '';
  const firstJa = home?.seniorNameJa?.split(' ')[1] ?? first;
  const anonymous = item.share?.name !== 'first';
  return {
    id: item.id, name: item.name, nameJa: item.nameJa, year: item.year, glyph: item.glyph, story: item.story, storyJa: item.storyJa,
    audioUrl: item.share?.audio ? item.audioUrl : undefined,
    teller: anonymous ? `Someone in ${home?.town ?? 'Japan'}` : `${first}, ${home?.town ?? ''}`,
    tellerJa: anonymous ? `${home?.townJa ?? ''}の方` : `${firstJa}さん（${home?.townJa ?? ''}）`,
    sharedAt: item.share!.at,
    comments: (item.comments ?? []).filter((c) => c.status === 'shown').map(({ from, message, at }) => ({ from, message, at })),
  };
}
const sharedItem = (id: string) => db.items.find((i) => i.id === id && i.share && (i.story || i.storyJa));
const CONTACT = /(https?:\/\/|www\.|@[a-z0-9-]+\.|\b\d{2,4}[-\s]?\d{3,4}[-\s]?\d{4}\b|line\s*id)/i;

app.get('/api/stories', (_req, res) => {
  res.json(db.items.filter((i) => i.share && (i.story || i.storyJa)).sort((a, b) => b.share!.at.localeCompare(a.share!.at)).map(publicStory));
});

app.post('/api/stories/:itemId/comments', (req, res) => {
  const item = sharedItem(req.params.itemId);
  if (!item) return fail(res, 404, 'This story is not shared.');
  const from = String(req.body?.from ?? '').trim().slice(0, 40);
  const message = String(req.body?.message ?? '').trim();
  if (!from) return fail(res, 400, 'Add your first name.');
  if (message.length < 2 || message.length > 400) return fail(res, 400, 'Write a short message (up to 400 characters).');
  if (CONTACT.test(message) || CONTACT.test(from)) return fail(res, 400, 'Please leave out links, phone numbers and emails. Messages are only for kind words.');
  (item.comments ??= []).push({ id: id('cm'), from, message, at: now(), status: 'pending' });
  save();
  res.status(201).json({ ok: true, pending: true });
});

app.post('/api/items/:id/share', (req, res) => {
  const item = findItem(req.params.id);
  if (!item) return fail(res, 404, 'Item not found.');
  const { share, name, audio } = req.body ?? {};
  if (!share) { delete item.share; save(); return res.json(item); }
  if (!item.story && !item.storyJa) return fail(res, 400, 'Save her story first.');
  if (audio && !item.audioUrl) return fail(res, 400, 'There is no recording to share.');
  item.share = { at: now().slice(0, 10), name: name === 'first' ? 'first' : 'anonymous', audio: Boolean(audio) };
  save();
  res.json(item);
});

app.post('/api/items/:id/comments/:cid', (req, res) => {
  const item = findItem(req.params.id);
  const c = item?.comments?.find((x) => x.id === req.params.cid);
  if (!item || !c) return fail(res, 404, 'Message not found.');
  if (!['shown', 'hidden'].includes(req.body?.status)) return fail(res, 400, 'Show or hide the message.');
  c.status = req.body.status;
  save();
  res.json(item);
});

// ---------- Help at home: she asks, a checked worker is booked, she says how it went ----------

app.post('/api/home/:id/services', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const { kind, when, by, note, fixId } = req.body ?? {};
  const fix = fixId ? home.safety.find((f) => f.id === fixId) : undefined;
  if (fixId && !fix) return fail(res, 400, 'Fix not found.');
  if (fix && fix.status !== 'agreed') return fail(res, 400, 'Book a builder only for a fix she agreed to.');
  if (!(HELP_KINDS as string[]).concat(fix ? ['builder'] : []).includes(kind)) return fail(res, 400, 'Choose what kind of help.');
  if (fix && home.services.some((s) => s.fixId === fix.id && s.status !== 'cancelled')) return fail(res, 409, 'A builder is already asked for this fix.');
  const request = {
    id: id('svc'), kind: kind as ServiceKind, when: when === 'next-visit' ? 'next-visit' as const : 'soon' as const,
    by: by === 'student' ? 'student' as const : 'her' as const, note: note ? String(note).trim().slice(0, 300) : undefined,
    fixId: fix?.id, status: 'requested' as const, createdAt: now().slice(0, 10),
  };
  home.services.unshift(request);
  save();
  res.status(201).json(home.services);
});

app.post('/api/home/:id/services/:sid/book', (req, res) => {
  const home = findHome(req.params.id);
  const svc = home?.services.find((s) => s.id === req.params.sid);
  if (!home || !svc) return fail(res, 404, 'Request not found.');
  if (svc.status !== 'requested') return fail(res, 409, 'This request is already booked or closed.');
  const worker = home.workers.find((w) => w.id === req.body?.workerId);
  if (!worker) return fail(res, 400, 'Choose a worker.');
  if (!worker.skills.includes(svc.kind)) return fail(res, 400, `${worker.name} does not do this kind of work.`);
  if (!isCleared(worker)) return fail(res, 403, `${worker.name} has not finished the checks yet, so cannot be booked.`);
  const date = String(req.body?.date ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(res, 400, 'Enter a date like 2026-10-20.');
  const fix = svc.fixId ? home.safety.find((f) => f.id === svc.fixId) : undefined;
  if (SERVICE_CATALOG[svc.kind].unit === 'hour') {
    const hours = Number(req.body?.hours);
    if (!(hours > 0 && hours <= 8)) return fail(res, 400, 'Enter 0.5 to 8 hours.');
    svc.hours = Math.round(hours * 2) / 2;
    svc.priceJpy = Math.round(svc.hours * SERVICE_CATALOG[svc.kind].priceJpy);
  } else if (fix) {
    svc.priceJpy = fixCost(fix);
  }
  Object.assign(svc, { status: 'booked', workerId: worker.id, date });
  save();
  res.json(home.services);
});

app.post('/api/home/:id/services/:sid/status', (req, res) => {
  const home = findHome(req.params.id);
  const svc = home?.services.find((s) => s.id === req.params.sid);
  if (!home || !svc) return fail(res, 404, 'Request not found.');
  const { status, feedback } = req.body ?? {};
  if (status === 'done') {
    if (svc.status !== 'booked') return fail(res, 409, 'Only a booked job can be marked done.');
    svc.status = 'done';
    if (svc.fixId) { const fix = home.safety.find((f) => f.id === svc.fixId); if (fix) fix.status = 'done'; }
    const worker = home.workers.find((w) => w.id === svc.workerId);
    if (worker) worker.jobs += 1;
  } else if (status === 'cancelled') {
    if (svc.status === 'done') return fail(res, 409, 'This job is already done.');
    svc.status = 'cancelled';
  } else if (feedback) {
    if (svc.status !== 'done') return fail(res, 409, 'Say how it went once the job is done.');
    if (!['good', 'okay', 'not-good'].includes(feedback)) return fail(res, 400, 'Unknown feedback.');
    svc.feedback = feedback;
  } else return fail(res, 400, 'Nothing to change.');
  save();
  res.json(home.services);
});

// ---------- Field notes and the fresh-eyes check ----------

app.post('/api/home/:id/fieldnotes', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const { kind, text, by } = req.body ?? {};
  if (!['likes', 'avoid', 'tip'].includes(kind)) return fail(res, 400, 'Choose what kind of note this is.');
  if (!text || !String(text).trim()) return fail(res, 400, 'Write the note first.');
  home.fieldNotes.unshift({ id: id('note'), date: now().slice(0, 10), by: String(by || 'Student').slice(0, 40), kind, text: String(text).trim().slice(0, 300) });
  save();
  res.status(201).json(home.fieldNotes);
});

app.post('/api/report/check', async (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) return fail(res, 400, 'Write the report first.');
  res.json(await checkReport(text));
});

// A visit report reaches the family only after it passes the fresh-eyes check.
app.post('/api/home/:id/report', async (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const text = String(req.body?.text ?? '').trim();
  if (!text) return fail(res, 400, 'Write the report first.');
  const result = await checkReport(text);
  if (!result.ok) return res.status(422).json({ error: 'Some wording could read as pressure. Please reword the flagged phrases.', ...result });
  const today = now().slice(0, 10);
  let visit = home.visits.find((v) => v.date === today);
  if (!visit) {
    visit = { id: id('visit'), date: today, roomId: home.rooms.find((r) => r.status === 'now')?.id ?? home.rooms[0].id, summary: '', status: 'done' };
    home.visits.push(visit);
    home.visits.sort((a, b) => b.date.localeCompare(a.date));
  }
  visit.summary = text.slice(0, 2000);
  delete visit.summaryJa;
  visit.status = 'done';
  visit.checked = result.source;
  save();
  res.json(visit);
});

// ---------- Students: evaluation before visiting ----------

app.post('/api/home/:id/students/:sid/step', (req, res) => {
  const home = findHome(req.params.id);
  const student = home?.students.find((s) => s.id === req.params.sid);
  if (!home || !student) return fail(res, 404, 'Student not found.');
  const { step, passed } = req.body ?? {};
  if (!READINESS.includes(step)) return fail(res, 400, 'Unknown step.');
  if (step === 'signoff' && passed && READINESS.some((r) => r !== 'signoff' && !student.passed[r])) {
    return fail(res, 409, 'Every other step must be passed before sign-off.');
  }
  if (passed) student.passed[step as ReadinessStep] = now().slice(0, 10);
  else {
    delete student.passed[step as ReadinessStep];
    delete student.passed.signoff; // un-passing any step withdraws sign-off
  }
  save();
  res.json(student);
});

// ---------- Room photos for the digital 実家 (real captures only) ----------

app.post('/api/home/:id/rooms/:rid/photos', (req, res) => {
  const home = findHome(req.params.id);
  const room = home?.rooms.find((r) => r.id === req.params.rid);
  if (!home || !room) return fail(res, 404, 'Room not found.');
  const { base64, mime } = req.body ?? {};
  if (!base64) return fail(res, 400, 'No photo received.');
  if (room.photos.length >= 12) return fail(res, 400, 'This room already has 12 photos.');
  room.photos.push(saveUpload(`room-${room.id}`, base64, mime ?? 'image/jpeg'));
  room.capturedAt = now().slice(0, 10);
  save();
  res.json(room);
});

// ---------- From home to community: local activities ----------

app.post('/api/home/:id/activities/:aid', (req, res) => {
  const home = findHome(req.params.id);
  const act = home?.activities.find((a) => a.id === req.params.aid);
  if (!home || !act) return fail(res, 404, 'Activity not found.');
  const status = req.body?.status as ActivityStatus;
  if (!['suggested', 'proposed', 'accepted', 'not-now', 'attended'].includes(status)) return fail(res, 400, 'Unknown status.');
  act.status = status;
  if (status === 'accepted' && !act.companion) act.companion = home.students.find((s) => s.role === 'pair')?.name;
  save();
  res.json(act);
});

// ---------- Her touchpoints between visits ----------

// Gathers this month's stories and thank-yous into a draft letter (or returns the existing one).
app.post('/api/home/:id/letters', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const month = String(req.body?.month ?? new Date().toISOString().slice(0, 7));
  let letter = home.letters.find((l) => l.month === month);
  if (!letter) {
    const inMonth = (iso?: string) => Boolean(iso && iso.slice(0, 7) === month);
    const itemIds = db.items
      .filter((i) => i.homeId === home.id && (i.story || i.audioUrl) && (i.journey.some((j) => inMonth(j.at)) || i.thanks.some((t) => inMonth(t.at))))
      .map((i) => i.id);
    letter = { id: `l-${month}`, month, itemIds, note: String(req.body?.note ?? ''), status: 'draft' };
    home.letters.unshift(letter);
  } else if (typeof req.body?.note === 'string') {
    letter.note = req.body.note.slice(0, 600);
    delete letter.noteJa;
  }
  save();
  res.json(letter);
});

app.post('/api/letters/:id/status', (req, res) => {
  const home = db.homes.find((h) => h.letters.some((l) => l.id === req.params.id));
  const letter = home?.letters.find((l) => l.id === req.params.id);
  if (!letter) return fail(res, 404, 'Letter not found.');
  const status = req.body?.status;
  if (!['draft', 'printed', 'mailed'].includes(status)) return fail(res, 400, 'Unknown status.');
  letter.status = status;
  if (status === 'mailed') letter.mailedAt = now().slice(0, 10);
  save();
  res.json(letter);
});

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

// Printable A4 letter in large type, for posting to her.
app.get('/letters/:id', (req, res) => {
  const home = db.homes.find((h) => h.letters.some((l) => l.id === req.params.id));
  const letter = home?.letters.find((l) => l.id === req.params.id);
  if (!home || !letter) return res.status(404).send(page('Letter not found', 'Check the link in the app.'));
  const [y, m] = letter.month.split('-').map(Number);
  const first = home.seniorNameJa?.split(' ')[1] ?? home.seniorName.split(' ')[0];
  const items = letter.itemIds.map((iid) => findItem(iid)).filter(Boolean) as Item[];
  const blocks = items.map((it) => {
    const photo = it.photoUrl ? `<img src="${it.photoUrl}" alt="">` : `<div class="glyph">${esc(it.glyph)}</div>`;
    const thanks = it.thanks.filter((t) => t.at.slice(0, 7) === letter.month)
      .map((t) => `<p class="thanks">${esc(t.from)}さんより：「${esc(t.message)}」</p>`).join('');
    return `<section>${photo}<div><h2>${esc(it.nameJa ?? it.name)}<span>${esc(it.name)}</span></h2>${it.story || it.storyJa ? `<p class="story">「${esc(it.storyJa ?? it.story ?? '')}」</p>` : ''}${thanks}</div></section>`;
  }).join('');
  res.send(`<!doctype html><html lang="ja"><meta charset="utf-8"><title>思い出だより ${y}年${m}月</title>
<style>
@page { size: A4; margin: 18mm; }
body { font-family: "Hiragino Mincho ProN", "Yu Mincho", serif; color: #1d2433; background: #fbfaf7; font-size: 20px; line-height: 1.8; max-width: 760px; margin: 0 auto; padding: 32px; }
header { border-bottom: 3px solid #2b4c7e; padding-bottom: 12px; margin-bottom: 24px; }
h1 { font-size: 40px; margin: 0; letter-spacing: 0.1em; } header p { margin: 4px 0 0; font-size: 22px; }
section { display: grid; grid-template-columns: 140px 1fr; gap: 20px; padding: 18px 0; border-bottom: 1px solid #d9d7cf; break-inside: avoid; }
section img { width: 140px; height: 140px; object-fit: cover; border-radius: 10px; }
.glyph { width: 140px; height: 140px; border-radius: 10px; background: #e3e9f3; display: grid; place-items: center; font-size: 64px; }
h2 { font-size: 26px; margin: 0; } h2 span { font-size: 16px; color: #5b6273; margin-left: 12px; font-family: system-ui, sans-serif; }
.story { margin: 8px 0; } .thanks { margin: 8px 0; color: #4f6b3a; }
.note { background: #e3e9f3; padding: 18px 22px; border-radius: 10px; margin-top: 24px; }
footer { margin-top: 24px; font-size: 18px; color: #5b6273; }
@media print { body { background: #fff; padding: 0; } }
</style>
<header><h1>思い出だより</h1><p>${y}年${m}月　${esc(first)}さんへ</p></header>
${blocks || '<p>今月は、お茶とお話の時間でした。</p>'}
<div class="note"><p>${esc(letter.noteJa || letter.note || 'またお会いできるのを楽しみにしています。')}</p><p>${home.students.filter((s) => s.role === 'pair').map((s) => esc(s.name)).join('・')}より</p></div>
<footer>次の訪問：${esc(home.visits.find((v) => v.status === 'planned')?.date ?? '')}　お電話：${esc(home.calls.find((c) => c.status === 'planned')?.date ?? '')}</footer>
</html>`);
});

// Phone calls between visits: plan one, or log one that happened.
app.post('/api/home/:id/calls', (req, res) => {
  const home = findHome(req.params.id);
  if (!home) return fail(res, 404, 'Home not found.');
  const { date, by, minutes, mood, note, followUp } = req.body ?? {};
  if (mood !== undefined && !['good', 'okay', 'low'].includes(mood)) return fail(res, 400, 'Unknown mood.');
  const planned = home.calls.find((c) => c.status === 'planned');
  const call = planned ?? { id: id('call'), date: String(date ?? now().slice(0, 10)), by: String(by ?? home.students[0].name), status: 'planned' as const };
  Object.assign(call, {
    status: 'done' as const,
    date: String(date ?? call.date),
    minutes: Number(minutes) || undefined,
    mood,
    note: note ? String(note).slice(0, 500) : undefined,
    followUp: Boolean(followUp),
  });
  if (!planned) home.calls.unshift(call);
  // Book the next call two weeks after the next visit.
  const next = home.visits.find((v) => v.status === 'planned');
  if (next && !home.calls.some((c) => c.status === 'planned')) {
    const d = new Date(`${next.date}T12:00:00`);
    d.setDate(d.getDate() + 14);
    home.calls.push({ id: id('call'), date: d.toISOString().slice(0, 10), by: call.by, status: 'planned' });
  }
  save();
  res.json(home.calls);
});

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
