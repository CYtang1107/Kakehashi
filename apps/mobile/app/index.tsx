import React from 'react';
import { Screen } from '../src/ui';
import { useI18n } from '../src/i18n';
import { StoriesFeedContent } from './stories';

export default function HomePage() {
	const { t } = useI18n();
	return <Screen requiresHome={false} wide fit globalNav="home"
    header={{ eyebrow: t('roleEntryEyebrow'), title: t('feedTitle'), sub: t('feedLead') }}>
		<StoriesFeedContent />
	</Screen>;
}
