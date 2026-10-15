import { AppText as Text } from '../../src/design-system/AppText';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Home } from '@kakehashi/shared';
import { Button, Card, Columns, Pill, Screen, StatusBanner, formatDate } from '../../src/ui';
import { useData } from '../../src/data';
import { useI18n } from '../../src/i18n';
import { api } from '../../src/api';
import { colors, fonts, type, yen } from '../../src/theme';

const PROCEEDS: Home['proceedsChoice'][] = ['keep', 'grandchild', 'donate'];

export default function PlanScreen() {
  const { data, refresh, showToast } = useData();
  const { t, lang } = useI18n();
  const [chosen, setChosen] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!data) return <Screen>{null}</Screen>;

  const planId = chosen ?? data.home.planId ?? data.plans[0].id;
  const plan = data.plans.find((p) => p.id === planId)!;

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.checkout(data.home.id, plan.id);
      if (r.mode === 'stripe-test') await WebBrowser.openBrowserAsync(r.url);
      else showToast(`${t('paid')} · ${yen(r.payment.amountJpy)}`);
      await refresh();
    } catch (e) {
      setError(t('rPaymentError'));
    } finally {
      setBusy(false);
    }
  };

  const setProceeds = async (choice: Home['proceedsChoice']) => {
    try { await api.proceeds(data.home.id, choice); await refresh(); } catch (e) { setError(t('rSaveError')); }
  };

  return (
    <Screen wide fit header={{ title: t('plansTitle'), sub: t('plansLead') }}>
      <Columns fill scrollLeft
        left={<>
      <StatusBanner title={t('rDemo')} message={t(data.services.payments === 'stripe-test' ? 'rPaymentTest' : 'rPaymentDemo')} />
      {data.plans.map((p) => {
        const active = p.id === planId;
        return (
          <Pressable key={p.id} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setChosen(p.id)}
            style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  padding: 14, borderRadius: 16, borderWidth: active ? 2 : 1, borderColor: active ? colors.ai : colors.line, backgroundColor: colors.sheet, gap: 6 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }}>
              <Text style={[type.section, { flex: 1 }]}>{lang === 'ja' ? p.nameJa : p.name}</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink }}>{yen(p.priceJpy)}</Text>
              <Text style={type.caption}>{t('perMonth')}</Text>
            </View>
            <Text style={type.caption}>{p.visitsPerMonth === 1 ? t('visitsPerMonthOne') : t('visitsPerMonth', { n: p.visitsPerMonth })} · {p.description}</Text>
            {data.home.planId === p.id ? <Pill label={t('currentPlan')} /> : null}
          </Pressable>
        );
      })}
        </>}
        right={<>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <Text style={[type.bodyBold, { flex: 1 }]}>{t('youPay')}</Text>
          <Text style={[type.section, { fontVariant: ['tabular-nums'] }]}>{yen(plan.priceJpy)}</Text>
        </View>
        <Button label={t('payNow')} icon="credit-card" busy={busy} onPress={pay} />
        <Text style={type.caption}>{data.services.payments === 'stripe-test' ? t('stripeTest') : t('demoMode')}</Text>
        {error ? <StatusBanner tone="error" title={error} /> : null}
      </Card>

      <Card style={{ backgroundColor: colors.mossTint, borderColor: 'transparent' }}>
        <Text style={type.section}>{t('proceedsTitle')}</Text>
        <Text style={type.body}>{t('proceedsBody', { amount: yen(data.seniorProceedsJpy) })}</Text>
        <Text style={type.bodyBold}>{t('proceedsChoice')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PROCEEDS.map((c) => {
            const on = data.home.proceedsChoice === c;
            return (
              <Pressable key={c} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setProceeds(c)}
                style={{ minHeight: 56, maxWidth: '100%', justifyContent: 'center',  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: on ? colors.moss : colors.line, backgroundColor: on ? colors.sheet : 'transparent' }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? colors.moss : colors.inkSoft }}>{t(`proceeds_${c}`)}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text style={type.section}>{t('payments')}</Text>
      {data.home.payments.length === 0 ? <Text style={type.caption}>{t('noPayments')}</Text> : data.home.payments.map((p) => (
        <Card key={p.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[type.body, { flex: 1 }]}>{formatDate(p.at, lang)} · {t(p.mode === 'demo' ? 'demoMode' : 'stripeTest')}</Text>
            <Text style={[type.bodyBold, { fontVariant: ['tabular-nums'] }]}>{yen(p.amountJpy)}</Text>
          </View>
          <Text style={type.caption}>{t('paid')}</Text>
        </Card>
      ))}
        </>}
      />
    </Screen>
  );
}
