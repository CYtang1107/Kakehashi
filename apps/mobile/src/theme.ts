import type { Decision, RoomStatus } from '@kakehashi/shared';

// Cool washi-grey ground (not cream), indigo (藍) accent; moss = keep, plum = family, persimmon = recycle.
export const colors = {
  paper: '#ECEEEA',
  sheet: '#FAFBF8',
  ink: '#1C2330',
  inkSoft: '#59616F',
  line: '#D5D9D1',
  ai: '#2B4C7E',
  aiTint: '#E3E9F3',
  moss: '#4F6B3A',
  mossTint: '#E6ECDF',
  plum: '#7A4A6E',
  plumTint: '#EFE3EC',
  kaki: '#B5562B',
  kakiTint: '#F4E3D9',
  danger: '#B3261E',
} as const;

export const fonts = {
  regular: 'ZenKakuGothicNew_400Regular',
  medium: 'ZenKakuGothicNew_500Medium',
  bold: 'ZenKakuGothicNew_700Bold',
  display: 'ShipporiMincho_700Bold',
  displaySemi: 'ShipporiMincho_600SemiBold',
} as const;

export const type = {
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 34, color: colors.ink },
  section: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.ink },
  bodyBold: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: colors.ink },
  caption: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 18, color: colors.inkSoft },
  eyebrow: { fontFamily: fonts.medium, fontSize: 13, color: colors.ai },
  story: { fontFamily: fonts.displaySemi, fontSize: 17, lineHeight: 28, color: colors.ink },
} as const;

export const decisionColor: Record<Decision, { fg: string; bg: string }> = {
  keep: { fg: colors.moss, bg: colors.mossTint },
  family: { fg: colors.plum, bg: colors.plumTint },
  pass: { fg: colors.ai, bg: colors.aiTint },
  recycle: { fg: colors.kaki, bg: colors.kakiTint },
  open: { fg: colors.inkSoft, bg: colors.paper },
};

export const roomColor: Record<RoomStatus, string> = {
  sorted: colors.mossTint,
  now: colors.aiTint,
  later: colors.sheet,
};

export const yen = (n: number) => `¥${Math.round(n).toLocaleString('en-US')}`;
