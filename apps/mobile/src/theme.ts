import type { Decision, RoomStatus } from '@kakehashi/shared';

// Semantic tokens; legacy names stay compatible with existing screens.
export const colors = {
  background: '#F5F6F3', surface: '#FFFFFF', secondary: '#E8F0EA', accent: '#F3D9C9',
  primary: '#245846', primaryPressed: '#173F31', text: '#202923', textSecondary: '#53645A',
  border: '#78877C', separator: '#DEE5DF', focus: '#245846', dangerSurface: '#FAEAE7', dangerPressed: '#F3DCD6',
  warningText: '#73501B', warningSurface: '#F5EBD6',
  controlSurface: '#EEF1ED', controlPressed: '#E2E8E1', disabledSurface: '#E9ECE7', disabledText: '#53645A',
  scrim: 'rgba(25, 29, 27, 0.44)',
  paper: '#F5F6F3', sheet: '#FFFFFF', ink: '#202923', inkSoft: '#53645A', line: '#78877C',
  night: '#245846', nightRaised: '#173F31', onPrimary: '#FFFFFF', onNight: '#FFFFFF', onNightSoft: '#E8F0EA',
  kakiNight: '#F3D9C9', kakiInk: '#8E401F', ai: '#245846', aiTint: '#E8F0EA',
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
  ai: '#173F31', disabledText: '#263E30',
} as const;

export const darkColors = {
  ...colors, background: '#17231D', surface: '#223229', secondary: '#30483A', accent: '#6D4B3D',
  primary: '#9BC7A9', primaryPressed: '#B6DDBF', text: '#F3F7F1', textSecondary: '#C1D0C4',
  border: '#789180', separator: '#40574A', focus: '#B6DDBF', dangerSurface: '#4A2927', dangerPressed: '#5B302C',
  warningText: '#F3D48E', warningSurface: '#4A3C24', paper: '#17231D', sheet: '#223229',
  ink: '#F3F7F1', inkSoft: '#C1D0C4', line: '#789180', night: '#0E1712', nightRaised: '#1B2A20',
  onPrimary: '#102016', onNight: '#F3F7F1', onNightSoft: '#D7E8DA', kakiNight: '#F1B99F', kakiInk: '#F1B99F',
  ai: '#9BC7A9', aiTint: '#30483A', moss: '#A8C98A', mossTint: '#30452D', plum: '#D2A9C8',
  plumTint: '#453342', indigo: '#ABC2EA', indigoTint: '#2F3D56', kaki: '#F1B99F', kakiTint: '#4A342D',
  danger: '#FF9D91',
  controlSurface: '#2B3C32', controlPressed: '#354D3E', disabledSurface: '#293A30', disabledText: '#B1C2B5',
  scrim: 'rgba(0, 0, 0, 0.64)',
} as const;

export const elderlyCareColors = {
  lavender: '#7F6890', avocado: '#C5D4AB', astra: '#FCE8B8', umami: '#F4BF90', mocha: '#A17A74',
} as const;

// Pastels are surfaces, paired with darker ink; alerts keep their safety colours.
export const herColors = {
  ...colors,
  background: '#FAF8F5', paper: '#FAF8F5', surface: '#FFFFFF', sheet: '#FFFFFF',
  primary: elderlyCareColors.lavender, primaryPressed: '#665176', focus: '#665176',
  secondary: '#F8F5FA', accent: elderlyCareColors.astra,
  text: '#2E2733', ink: '#2E2733', textSecondary: '#5B515F', inkSoft: '#5B515F',
  controlSurface: '#F2EEF4', controlPressed: '#E7DEED', disabledSurface: '#EEEAEF', disabledText: '#655B6B',
  border: elderlyCareColors.mocha, line: elderlyCareColors.mocha, separator: '#E6DFE5',
  night: '#584362', nightRaised: '#493650', onNightSoft: '#F0E9F4',
  kakiNight: elderlyCareColors.astra, kakiInk: '#76452A',
  ai: '#665176', aiTint: '#F0EAF4',
  moss: '#3D512F', mossTint: elderlyCareColors.avocado,
  plum: '#665176', plumTint: '#EEE7F2',
  indigo: '#5C4A70', indigoTint: '#F0EAF4',
  kaki: '#76452A', kakiTint: elderlyCareColors.umami,
} as const;

export const herHighContrastColors = {
  ...herColors, text: '#211A27', ink: '#211A27', textSecondary: '#403348', inkSoft: '#403348',
  border: '#584362', line: '#584362', primary: '#584362', primaryPressed: '#493650', focus: '#211A27',
  ai: '#584362', disabledText: '#403348',
} as const;

export const herDarkColors = {
  ...darkColors,
  background: '#211C25', paper: '#211C25', surface: '#2E2733', sheet: '#2E2733',
  primary: '#D7C1E5', primaryPressed: '#E8D7F2', onPrimary: '#302039', focus: '#E8D7F2',
  secondary: '#3E3247', accent: '#55462D', text: '#FAF5FC', ink: '#FAF5FC',
  textSecondary: '#D5C9DA', inkSoft: '#D5C9DA', border: '#B99D99', line: '#B99D99', separator: '#524557',
  night: '#19141E', nightRaised: '#302537', onNight: '#FAF5FC', onNightSoft: '#E8DDED',
  kakiNight: elderlyCareColors.astra, kakiInk: elderlyCareColors.umami,
  ai: '#D7C1E5', aiTint: '#3E3247', moss: elderlyCareColors.avocado, mossTint: '#34402C',
  plum: '#D7C1E5', plumTint: '#43324D', indigo: '#D7C1E5', indigoTint: '#3E3247',
  kaki: elderlyCareColors.umami, kakiTint: '#4C352A',
  controlSurface: '#392F40', controlPressed: '#493953', disabledSurface: '#382F3E', disabledText: '#C8BDCE',
} as const;

export const fonts = {
  regular: 'ZenKakuGothicNew_400Regular',
  medium: 'ZenKakuGothicNew_500Medium',
  bold: 'ZenKakuGothicNew_700Bold',
  display: 'ShipporiMincho_700Bold',
  displaySemi: 'ShipporiMincho_600SemiBold',
} as const;

// The platform face keeps Latin and Japanese UI familiar; memories retain their book-like serif.
export const systemFont = 'System';
export const type = {
  title: { fontFamily: systemFont, fontWeight: '700', fontSize: 34, lineHeight: 42, letterSpacing: -1, color: colors.ink },
  section: { fontFamily: systemFont, fontWeight: '600', fontSize: 23, lineHeight: 32, letterSpacing: -0.45, color: colors.ink },
  body: { fontFamily: systemFont, fontWeight: '400', fontSize: 19, lineHeight: 30, color: colors.ink },
  bodyBold: { fontFamily: systemFont, fontWeight: '600', fontSize: 19, lineHeight: 30, color: colors.ink },
  caption: { fontFamily: systemFont, fontWeight: '400', fontSize: 17, lineHeight: 26, color: colors.inkSoft },
  eyebrow: { fontFamily: systemFont, fontWeight: '600', fontSize: 15, lineHeight: 24, letterSpacing: 0.5, color: colors.kakiInk },
  story: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 34, color: colors.ink },
  value: { fontFamily: systemFont, fontWeight: '600', fontSize: 32, lineHeight: 40, letterSpacing: -0.8, color: colors.ink },
  button: { fontFamily: systemFont, fontWeight: '600', fontSize: 18, lineHeight: 27, letterSpacing: -0.15, color: colors.ink },
  navigation: { fontFamily: systemFont, fontWeight: '400', fontSize: 15, lineHeight: 21, color: colors.inkSoft },
} as const;

export const herType = {
  title: { ...type.title, fontSize: 32, lineHeight: 40, letterSpacing: -0.6 },
  section: { ...type.section, fontSize: 26, lineHeight: 35, letterSpacing: -0.3 },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 40 } as const;
export const radii = { control: 14, card: 24, dialog: 28 } as const;
export const surface = { cardPadding: 24, cardPaddingWide: 28, contentGap: 20, sectionGap: 32, dialogWidth: 600 } as const;
export const layout = { compactWidth: 760, wideWidth: 1240, wideMin: 1000, margin: 24, gap: 24 } as const;
export const control = { minimum: 48, secondary: 56, primary: 60, icon: 24 } as const;
export const textScale = { normal: 1, large: 1.15, extraLarge: 1.3 } as const;

// Phone defaults blend into the existing desktop tokens between 600 and 1000px.
export const mobileType = {
  title: { fontSize: 25, lineHeight: 34, letterSpacing: -0.5 },
  section: { fontSize: 19, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontSize: 16.5, lineHeight: 24 },
  bodyBold: { fontSize: 16.5, lineHeight: 24 },
  caption: { fontSize: 15, lineHeight: 21 },
  eyebrow: { fontSize: 14, lineHeight: 20 },
  story: { fontSize: 18, lineHeight: 27 },
  value: { fontSize: 25, lineHeight: 34, letterSpacing: -0.5 },
  button: { fontSize: 16.5, lineHeight: 23 },
  navigation: { fontSize: 14, lineHeight: 20 },
} as const;
export const herMobileType = {
  ...mobileType,
  title: { fontSize: 26, lineHeight: 35, letterSpacing: -0.4 },
  section: { fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
  body: { fontSize: 18, lineHeight: 26 },
  bodyBold: { fontSize: 18, lineHeight: 26 },
  caption: { fontSize: 16, lineHeight: 23 },
  eyebrow: { fontSize: 15, lineHeight: 21 },
  story: { fontSize: 19, lineHeight: 28 },
  button: { fontSize: 17.5, lineHeight: 25 },
  navigation: { fontSize: 15, lineHeight: 21 },
} as const;
export const mobileSurface = {
  gutter: 16, cardPadding: 16, contentGap: 12, sectionGap: 20,
  pageTop: 16, pageBottom: 24, toolbarPadding: 6,
} as const;
export const mobileControl = { ...control, primary: 50, secondary: 48, icon: 22, paddingVertical: 8, inputMultiline: 104 } as const;
export const herMobileControl = { ...mobileControl, primary: 54, secondary: 48, icon: 24 } as const;
export const mobileNavigation = { minimum: 56, icon: 22, gap: 2, padding: 3 } as const;
export const motion = { feedbackMs: 120, disclosureMs: 160, toastMs: 6000 } as const;
export const elevation = { shadowColor: '#202923', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.035, shadowRadius: 10, elevation: 1 } as const;
export const floatingElevation = { shadowColor: '#14291F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 6 } as const;

export type Palette = { [Key in keyof typeof colors]: string };
export const getDecisionColors = (palette: Palette): Record<Decision, { fg: string; bg: string }> => ({
  keep: { fg: palette.moss, bg: palette.mossTint },
  family: { fg: palette.plum, bg: palette.plumTint },
  pass: { fg: palette.indigo, bg: palette.indigoTint },
  recycle: { fg: palette.kaki, bg: palette.kakiTint },
  open: { fg: palette.inkSoft, bg: palette.paper },
});
export const decisionColor = getDecisionColors(colors);

export const getRoomColors = (palette: Palette): Record<RoomStatus, string> => ({
  sorted: palette.mossTint, now: palette.aiTint, later: palette.sheet,
});
export const roomColor = getRoomColors(colors);

export const yen = (n: number) => `¥${Math.round(n).toLocaleString('en-US')}`;
