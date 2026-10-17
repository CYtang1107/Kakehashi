import React from 'react';
import { HerPage } from '../../src/her/HerPage';
import { SaferHomeCard } from '../../src/SaferHome';
import { useI18n } from '../../src/i18n';
export default function Safety() { const { t } = useI18n(); return <HerPage back title={t('hSafety')}><SaferHomeCard mode="her" /></HerPage>; }
