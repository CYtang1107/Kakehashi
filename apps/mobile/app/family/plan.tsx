import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Button, Card, Heading, Pill, Screen, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { colors, fonts, type, yen } from '../../src/theme';

export default function PlanScreen() {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [chosen, setChosen] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!data) return <Screen>{null}</Screen>;

  const planId = chosen ?? data.home.planId ?? data.plans[0].id;
  const plan = data.plans.find((p) => p.id === planId)!;
  const credit = Math.min(data.resaleCreditJpy, plan.priceJpy - 1000);
  const total = plan.priceJpy - credit;

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.checkout(data.home.id, plan.id);
      if (r.mode === 'stripe-test') await WebBrowser.openBrowserAsync(r.url);
      else showToast(`${t('paid')} · ${yen(r.payment.amountJpy)}`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Heading title={t('plansTitle')} sub={t('plansLead')} />
      {data.plans.map((p) => {
        const active = p.id === planId;
        return (
          <Pressable key={p.id} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setChosen(p.id)}
            style={{ padding: 14, borderRadius: 16, borderWidth: active ? 2 : 1, borderColor: active ? colors.ai : colors.line, backgroundColor: colors.sheet, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text style={[type.section, { flex: 1 }]}>{lang === 'ja' ? p.nameJa : p.name}</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink }}>{yen(p.priceJpy)}</Text>
              <Text style={type.caption}>{t('perMonth')}</Text>
            </View>
            <Text style={type.caption}>{t('visitsPerMonth', { n: p.visitsPerMonth })} · {p.description}</Text>
            {data.home.planId === p.id ? <Pill label={t('currentPlan')} /> : null}
          </Pressable>
        );
      })}
      <Card>
        <Row label={lang === 'ja' ? plan.nameJa : plan.name} value={yen(plan.priceJpy)} />
        <Row label={t('resaleCredit')} value={`− ${yen(credit)}`} color={colors.moss} />
        <View style={{ height: 1, backgroundColor: colors.line }} />
        <Row label={t('youPay')} value={yen(total)} strong />
        <Button label={t('payNow')} icon="credit-card" busy={busy} onPress={pay} />
        <Text style={type.caption}>{data.services.payments === 'stripe-test' ? t('stripeTest') : t('demoMode')}</Text>
        {error ? <Text style={[type.caption, { color: colors.danger }]}>{error}</Text> : null}
      </Card>
      <Text style={type.section}>{t('payments')}</Text>
      {data.home.payments.length === 0 ? <Text style={type.caption}>{t('noPayments')}</Text> : data.home.payments.map((p) => (
        <Card key={p.id}>
          <Row label={`${formatDate(p.at, lang)} · ${p.mode === 'demo' ? 'demo' : 'Stripe test'}`} value={yen(p.amountJpy)} />
          <Text style={type.caption}>{t('resaleCredit')}: {yen(p.resaleCreditJpy)} · {t('paid')}</Text>
        </Card>
      ))}
    </Screen>
  );
}

function Row({ label, value, strong, color }: { label: string; value: string; strong?: boolean; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[strong ? type.bodyBold : type.body, { flex: 1 }]}>{label}</Text>
      <Text style={[strong ? type.section : type.body, { color: color ?? colors.ink, fontVariant: ['tabular-nums'] }]}>{value}</Text>
    </View>
  );
}
