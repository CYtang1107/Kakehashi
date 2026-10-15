import { AppText as Text } from './design-system/AppText';
import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { HELP_KINDS, SERVICE_CATALOG, WORKER_SHARE, isCleared, pick, type ServiceKind, type ServiceRequest, type ServiceStatus, type Worker } from '@kakehashi/shared';
import { StatusBanner, Button, Card, Field, Pill, formatDate } from './ui';
import { useData } from './data';
import { useI18n, type Key } from './i18n';
import { api } from './api';
import { colors, fonts, type, yen } from './theme';

export const serviceTone: Record<ServiceStatus, { fg: string; bg: string }> = {
  requested: { fg: colors.kaki, bg: colors.kakiTint },
  open: { fg: colors.warningText, bg: colors.warningSurface },
  booked: { fg: colors.ai, bg: colors.aiTint },
  done: { fg: colors.moss, bg: colors.mossTint },
  cancelled: { fg: colors.inkSoft, bg: colors.paper },
};

export const workerName = (w: Worker | undefined, lang: 'en' | 'ja') => (w ? pick(lang, w.name, w.nameJa) : '');

// Help at home: she asks (or the students ask with her OK); students book a checked worker at a fixed price;
// the family sees what was booked, what it costs and what the worker receives.
export function ServicesCard({ mode }: { mode: 'student' | 'family' }) {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('2');
  const [askKind, setAskKind] = useState<ServiceKind>('garden');
  const [posting, setPosting] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [agreed, setAgreed] = useState(false);
  if (!data) return null;
  const { home } = data;
  const services = home.services.filter((s) => mode === 'student' || s.status !== 'cancelled');

  const run = async (key: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(key); setError(null);
    try { await fn(); await refresh(); if (done) showToast(done); return true; }
    catch (e) { setError(t('rSaveError')); return false; }
    finally { setBusy(null); }
  };

  const startBooking = (s: ServiceRequest) => {
    setOpen(open === s.id ? null : s.id);
    setWorkerId(null);
    const next = home.visits.find((v) => v.status === 'planned')?.date;
    setDate(s.when === 'next-visit' && next ? next : '');
    setHours('2');
  };

  return (
    <Card>
      <Text style={type.section}>{t('servicesTitle')}</Text>
      <Text style={type.caption}>{mode === 'student' ? t('servicesLeadStudent') : t('servicesLeadFamily')}</Text>
      {services.map((s) => {
        const w = home.workers.find((x) => x.id === s.workerId);
        const fix = s.fixId ? home.safety.find((f) => f.id === s.fixId) : undefined;
        const room = fix ? home.rooms.find((r) => r.id === fix.roomId) : undefined;
        const eligible = home.workers.filter((x) => x.skills.includes(s.kind));
        const hourly = SERVICE_CATALOG[s.kind].unit === 'hour';
        return (
          <View key={s.id} style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8,  }}>
              <Text style={[type.bodyBold, { flex: 1 }]}>{t(`svc_${s.kind}` as Key)}{fix ? ` · ${t(`fix_${fix.kind}` as Key)}${room ? ` (${lang === 'ja' ? room.nameJa : room.name})` : ''}` : ''}</Text>
              {s.priceJpy ? <Text style={[type.bodyBold, { fontVariant: ['tabular-nums'] }]}>{yen(s.priceJpy)}</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Pill label={t(`svcstatus_${s.status}` as Key)} color={serviceTone[s.status].fg} bg={serviceTone[s.status].bg} />
              <Pill label={t(`askedBy_${s.by}` as Key)} color={colors.inkSoft} bg={colors.paper} />
              {s.feedback ? <Pill label={t('feedbackLabel', { fb: t(`fb_${s.feedback}` as Key) })} color={s.feedback === 'not-good' ? colors.danger : colors.moss} bg={s.feedback === 'not-good' ? '#F6DEDC' : colors.mossTint} /> : null}
            </View>
            {s.note ? <Text style={type.caption}>{pick(lang, s.note, s.noteJa)}</Text> : null}
            {w && s.date ? (
              <Text style={type.body}>
                {workerName(w, lang)} · {pick(lang, w.from, w.fromJa)} · {s.hours ? t('comingOn', { date: formatDate(s.date, lang), hours: s.hours }) : formatDate(s.date, lang)}
                {s.priceJpy ? <Text style={type.caption}>{`  (${t('workerGets', { amount: yen(s.priceJpy * WORKER_SHARE) })})`}</Text> : null}
              </Text>
            ) : null}

            {mode === 'student' && s.status === 'requested' ? (
              <>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <Button label={t('bookButton')} kind="secondary" icon="calendar" onPress={() => { setPosting(null); startBooking(s); }} />
                  {SERVICE_CATALOG[s.kind].unit === 'hour' ? (
                    <Button label={t('postJob')} kind="secondary" icon="clipboard" onPress={() => {
                      setOpen(null); setPosting(posting === s.id ? null : s.id); setAgreed(false); setHours('2');
                      setPrice(String(SERVICE_CATALOG[s.kind].priceJpy * 2)); setDate(home.visits.find((v) => v.status === 'planned')?.date ?? '');
                    }} />
                  ) : null}
                </View>
                {posting === s.id ? (
                  <View style={{ gap: 8, padding: 10, borderRadius: 12, backgroundColor: colors.paper }}>
                    <Text style={type.caption}>{t('postJobLead')}</Text>
                    <Field label={t('priceLabel')} value={price} onChangeText={setPrice} keyboardType="number-pad" />
                    <Field label={t('dateLabel')} value={date} onChangeText={setDate} placeholder="2026-10-20" />
                    <Field label={t('hoursLabel')} value={hours} onChangeText={setHours} keyboardType="decimal-pad" />
                    <Text style={type.caption}>{t('postSplit', { worker: yen((Number(price) || 0) * WORKER_SHARE), fee: yen((Number(price) || 0) * (1 - WORKER_SHARE)) })}</Text>
                    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => setAgreed(!agreed)} style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <Feather name={agreed ? 'check-square' : 'square'} size={20} color={agreed ? colors.moss : colors.inkSoft} />
                      <Text style={[type.body, { flex: 1 }]}>{t('priceAgreed')}</Text>
                    </Pressable>
                    <Button label={t('postJob')} icon="send" busy={busy === `post-${s.id}`} disabled={!agreed || !(Number(price) > 0) || !date}
                      onPress={() => run(`post-${s.id}`, () => api.postJob(home.id, s.id, { priceJpy: Number(price), date, hours: Number(hours) || undefined, agreed }), t('jobPosted')).then((ok) => { if (ok) setPosting(null); })} />
                  </View>
                ) : null}
                {open === s.id ? (
                  <View style={{ gap: 8, padding: 10, borderRadius: 12, backgroundColor: colors.paper }}>
                    <Text style={type.eyebrow}>{t('chooseWorker')}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {eligible.map((x) => {
                        const ok = isCleared(x);
                        const on = workerId === x.id;
                        return (
                          <Pressable key={x.id} accessibilityRole="radio" accessibilityState={{ checked: on, disabled: !ok }} disabled={!ok} onPress={() => setWorkerId(x.id)}
                            style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: on ? colors.ai : colors.line, backgroundColor: on ? colors.aiTint : colors.sheet, opacity: ok ? 1 : 0.55 }}>
                            <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? colors.ai : colors.ink }}>{workerName(x, lang)}</Text>
                            <Text style={type.caption}>{ok ? `${pick(lang, x.from, x.fromJa)} · ${t('jobsDone', { n: x.jobs })}` : t('notCleared')}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Field label={t('dateLabel')} value={date} onChangeText={setDate} placeholder="2026-10-20" />
                    {hourly ? (
                      <>
                        <Field label={t('hoursLabel')} value={hours} onChangeText={setHours} keyboardType="decimal-pad" />
                        <Text style={type.caption}>{t('perHour', { price: yen(SERVICE_CATALOG[s.kind].priceJpy) })} · {yen((Number(hours) || 0) * SERVICE_CATALOG[s.kind].priceJpy)}</Text>
                      </>
                    ) : null}
                    <Button label={t('bookButton')} icon="check" busy={busy === `book-${s.id}`} disabled={!workerId || !date}
                      onPress={() => run(`book-${s.id}`, () => api.bookHelp(home.id, s.id, { workerId: workerId!, date, hours: hourly ? Number(hours) : undefined }), t('saved')).then((ok) => { if (ok) setOpen(null); })} />
                  </View>
                ) : null}
              </>
            ) : null}
            {s.status === 'open' ? (
              <Text style={type.caption}>{t('onBoard', { date: formatDate(s.date ?? '', lang) })}</Text>
            ) : null}
            {mode === 'student' && s.status === 'open' ? (
              <Button label={t('cancelJob')} kind="secondary" busy={busy === `x-${s.id}`} onPress={() => run(`x-${s.id}`, () => api.helpStatus(home.id, s.id, { status: 'cancelled' }))} />
            ) : null}
            {mode === 'student' && s.status === 'booked' ? (
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Button label={t('markDone')} kind="secondary" icon="check" busy={busy === `done-${s.id}`} onPress={() => run(`done-${s.id}`, () => api.helpStatus(home.id, s.id, { status: 'done' }))} />
                <Button label={t('cancelJob')} kind="secondary" busy={busy === `x-${s.id}`} onPress={() => run(`x-${s.id}`, () => api.helpStatus(home.id, s.id, { status: 'cancelled' }))} />
              </View>
            ) : null}
          </View>
        );
      })}

      {mode === 'student' ? (
        <View style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {HELP_KINDS.map((k) => (
              <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: askKind === k }} onPress={() => setAskKind(k)}
                style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: askKind === k ? colors.ai : colors.line, backgroundColor: askKind === k ? colors.aiTint : colors.sheet }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: askKind === k ? colors.ai : colors.ink }}>{t(`svc_${k}` as Key)}</Text>
              </Pressable>
            ))}
          </View>
          <Button label={t('askForHer')} icon="plus" busy={busy === 'ask'} onPress={() => run('ask', () => api.askHelp(home.id, { kind: askKind, when: 'soon', by: 'student' }), t('saved'))} />
        </View>
      ) : (
        <Text style={type.caption}>{t('servicesWorkers')}</Text>
      )}
      {error ? <StatusBanner tone="error" title={error} /> : null}
    </Card>
  );
}
