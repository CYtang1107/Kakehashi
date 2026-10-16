// WCAG contrast check for the colour pairs the app uses. Run: npm run contrast -w apps/mobile
import { colors, darkColors, decisionColor, getDecisionColors, highContrastColors } from '../src/theme';

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const c = colors as Record<string, string>;
// [label, text, background, minimum]
const pairs: [string, string, string, number][] = [
  ['band title', c.onNight, c.night, 4.5],
  ['band caption', c.onNightSoft, c.night, 4.5],
  ['band eyebrow / active tab', c.kakiNight, c.night, 4.5],
  ['chip in band', c.onNight, c.nightRaised, 4.5],
  ['persimmon on raised', c.kakiNight, c.nightRaised, 4.5],
  ['primary button', c.onNight, c.night, 4.5],
  ['eyebrow on paper', c.kakiInk, c.paper, 4.5],
  ['eyebrow on sheet', c.kakiInk, c.sheet, 4.5],
  ['eyebrow on tinted card', c.kakiInk, c.aiTint, 4.5],
  ['body on paper', c.ink, c.paper, 4.5],
  ['caption on paper', c.inkSoft, c.paper, 4.5],
  ['caption on sheet', c.inkSoft, c.sheet, 4.5],
  ['primary on sage', c.primary, c.secondary, 4.5],
  ['body on accent', c.ink, c.accent, 4.5],
  ['secondary on sage', c.inkSoft, c.secondary, 4.5],
  ['open service status', c.warningText, c.warningSurface, 4.5],
  ['danger on surface', c.danger, c.surface, 4.5],
  ['danger on error surface', c.danger, c.dangerSurface, 4.5],
  ['input outline', c.border, c.surface, 3],
  ['focus on paper', c.focus, c.paper, 3],
  ['focus on sage', c.focus, c.secondary, 3],
  ['high contrast body', highContrastColors.ink, c.paper, 7],
  ['high contrast supporting text', highContrastColors.inkSoft, c.paper, 7],
  ['high contrast outline', highContrastColors.border, c.surface, 3],
  ['high contrast primary', c.onNight, highContrastColors.primary, 4.5],
  ...Object.entries(decisionColor).map(([k, d]) => [`decision ${k}`, d.fg, d.bg, 4.5] as [string, string, string, number]),
  ['dark body', darkColors.ink, darkColors.paper, 4.5],
  ['dark supporting text', darkColors.inkSoft, darkColors.sheet, 4.5],
  ['dark primary', darkColors.onPrimary, darkColors.primary, 4.5],
  ['dark primary pressed', darkColors.onPrimary, darkColors.primaryPressed, 4.5],
  ['dark night text', darkColors.onNight, darkColors.night, 4.5],
  ['dark input outline', darkColors.border, darkColors.surface, 3],
  ['dark focus', darkColors.focus, darkColors.paper, 3],
  ['dark warning', darkColors.warningText, darkColors.warningSurface, 4.5],
  ['dark error', darkColors.danger, darkColors.dangerSurface, 4.5],
  ...Object.entries(getDecisionColors(darkColors)).map(([k, d]) => [`dark decision ${k}`, d.fg, d.bg, 4.5] as [string, string, string, number]),
];

let failed = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = fg && bg ? ratio(fg, bg) : NaN;
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2)}:1  ${label} (${fg} on ${bg})`);
}
if (failed) { console.error(`${failed} pair(s) below WCAG AA`); process.exit(1); }
