import React, { useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { parseTag } from '@kakehashi/shared';
import { Button, Card, Field, Heading, Screen } from '../../src/ui';
import { useI18n } from '../../src/i18n';
import { colors, type } from '../../src/theme';

export default function OwnerScan() {
  const { t } = useI18n();
  const [perm, ask] = useCameraPermissions();
  const [code, setCode] = useState('');
  const busy = useRef(false);

  const openTag = (raw: string) => {
    const c = parseTag(raw) ?? raw.trim().toUpperCase();
    if (!c || busy.current) return;
    busy.current = true;
    router.push(`/tag/${c}`);
    setTimeout(() => { busy.current = false; }, 1500);
  };

  return (
    <Screen>
      <Heading title={t('ownerHello')} sub={t('ownerLead')} />
      <View style={{ height: 300, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
        {perm?.granted ? (
          <>
            <CameraView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => openTag(data)} />
            <View style={{ width: 200, height: 200, borderRadius: 22, borderWidth: 3, borderColor: colors.sheet }} />
          </>
        ) : (
          <View style={{ alignItems: 'center', gap: 12, padding: 24 }}>
            <Feather name="camera-off" size={30} color={colors.sheet} />
            <Text style={[type.body, { color: colors.sheet, textAlign: 'center' }]}>{t('cameraOff')}</Text>
            <Button label={t('allowCamera')} onPress={ask} />
          </View>
        )}
      </View>
      {Platform.OS === 'web' ? <Text style={type.caption}>QR scanning works best in the phone app (Expo Go). On the web, type the code below.</Text> : null}
      <Card>
        <Field label={t('enterCode')} value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="KK-0472-SEW" />
        <Button label={t('open')} disabled={!code.trim()} onPress={() => openTag(code)} />
        <Button label={t('tryExample')} kind="secondary" onPress={() => openTag('kakehashi:tag:KK-0472-SEW')} />
      </Card>
    </Screen>
  );
}
