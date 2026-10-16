import React from 'react';
import { View } from 'react-native';
import { AppText, Screen } from '../src/ui';
import { useI18n } from '../src/i18n';
import { StoriesFeedContent } from './stories';

export default function HomePage() {
	const { t } = useI18n();
	return <Screen requiresHome={false} globalNav="home" header={{ title: 'KAKEHASHI 架け橋' }}>
		<View style={{ gap: 12 }}>
			<AppText variant="section">{t('roleEntryEyebrow')}</AppText>
			<AppText>{t('feedLead')}</AppText>
			<AppText variant="title">{t('feedTitle')}</AppText>
			<StoriesFeedContent />
		</View>
	</Screen>;
}
