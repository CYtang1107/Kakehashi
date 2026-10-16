import type { Decision, RoomStatus } from '@kakehashi/shared';

// Semantic tokens; legacy names stay compatible with existing screens.
export const colors = {
  background: '#F8F7F2', surface: '#FFFFFF', secondary: '#E3EFE7', accent: '#F3D9C9',
  primary: '#235A46', primaryPressed: '#173F31', text: '#202923', textSecondary: '#506358',
  border: '#718578', separator: '#D3DED5', focus: '#235A46', dangerSurface: '#FAEAE7',
  warningText: '#73501B', warningSurface: '#F5EBD6',
  paper: '#F8F7F2', sheet: '#FFFFFF', ink: '#202923', inkSoft: '#506358', line: '#718578',
  night: '#235A46', nightRaised: '#173F31', onNight: '#FFFFFF', onNightSoft: '#E3EFE7',
  kakiNight: '#F3D9C9', kakiInk: '#8E401F', ai: '#235A46', aiTint: '#E3EFE7',
  moss: '#4F6B3A',
  mossTint: '#E6ECDF',
  plum: '#7A4A6E',
  plumTint: '#EFE3EC',
  indigo: '#2B4C7E', indigoTint: '#E3E9F3',
  kaki: '#8E401F', kakiTint: '#F3D9C9', danger: '#A52B23',
} as const;

export const highContrastColors = {
  ...colors, text: '#101B14', ink: '#101B14', textSecondary: '#263E30', inkSoft: '#263E30',
  border: '#263E30', line: '#263E30', primary: '#173F31', focus: '#101B14',
} as const;

export const darkColors = {
  ...colors, background: '#17231D', surface: '#223229', secondary: '#30483A', accent: '#6D4B3D',
  primary: '#9BC7A9', primaryPressed: '#B6DDBF', text: '#F3F7F1', textSecondary: '#C1D0C4',
  border: '#789180', separator: '#40574A', focus: '#B6DDBF', dangerSurface: '#4A2927',
  warningText: '#F3D48E', warningSurface: '#4A3C24', paper: '#17231D', sheet: '#223229',
  ink: '#F3F7F1', inkSoft: '#C1D0C4', line: '#789180', night: '#0E1712', nightRaised: '#1B2A20',
  onNight: '#102016', onNightSoft: '#D7E8DA', kakiNight: '#F1B99F', kakiInk: '#F1B99F',
  ai: '#9BC7A9', aiTint: '#30483A', moss: '#A8C98A', mossTint: '#30452D', plum: '#D2A9C8',
  plumTint: '#453342', indigo: '#ABC2EA', indigoTint: '#2F3D56', kaki: '#F1B99F', kakiTint: '#4A342D',
  danger: '#FF9D91',
} as const;

export const fonts = {
  regular: 'ZenKakuGothicNew_400Regular',
  medium: 'ZenKakuGothicNew_500Medium',
  bold: 'ZenKakuGothicNew_700Bold',
  display: 'ShipporiMincho_700Bold',
  displaySemi: 'ShipporiMincho_600SemiBold',
} as const;

export const type = {
  title: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 42, color: colors.ink },
  section: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 34, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 19, lineHeight: 30, color: colors.ink },
  bodyBold: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 30, color: colors.ink },
  caption: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 27, color: colors.inkSoft },
  eyebrow: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 27, color: colors.kakiInk },
  story: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 34, color: colors.ink },
  value: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 40, color: colors.ink },
  button: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 28, color: colors.ink },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 40 } as const;
export const radii = { control: 12, card: 16, dialog: 20 } as const;
export const layout = { compactWidth: 680, wideWidth: 1200, wideMin: 1000, margin: 20, gap: 24 } as const;
export const control = { minimum: 48, secondary: 56, primary: 60, icon: 24 } as const;
export const textScale = { normal: 1, large: 1.15, extraLarge: 1.3 } as const;
export const motion = { feedbackMs: 140, toastMs: 6000 } as const;
export const elevation = { shadowColor: '#202923', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 } as const;

export const decisionColor: Record<Decision, { fg: string; bg: string }> = {
  keep: { fg: colors.moss, bg: colors.mossTint },
  family: { fg: colors.plum, bg: colors.plumTint },
  pass: { fg: colors.indigo, bg: colors.indigoTint },
  recycle: { fg: colors.kaki, bg: colors.kakiTint },
  open: { fg: colors.inkSoft, bg: colors.paper },
};

export const roomColor: Record<RoomStatus, string> = {
  sorted: colors.mossTint,
  now: colors.aiTint,
  later: colors.sheet,
};

export const yen = (n: number) => `¥${Math.round(n).toLocaleString('en-US')}`;
