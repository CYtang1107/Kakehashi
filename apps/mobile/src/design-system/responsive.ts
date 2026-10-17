import { control, herMobileControl, herMobileType, herType, layout, mobileControl, mobileNavigation, mobileSurface, mobileType, spacing, surface, type } from '../theme';

export function responsiveValue(phone: number, desktop: number, width: number) {
  const progress = Math.max(0, Math.min(1, (width - 600) / (layout.wideMin - 600)));
  return phone + (desktop - phone) * progress;
}

export function responsiveMetrics(width: number, olderAdult: boolean) {
  const value = (phone: number, desktop: number) => responsiveValue(phone, desktop, width);
  const controls = olderAdult ? herMobileControl : mobileControl;
  return {
    gutter: value(mobileSurface.gutter, layout.margin),
    cardPadding: value(mobileSurface.cardPadding, surface.cardPadding),
    contentGap: value(mobileSurface.contentGap, surface.contentGap),
    sectionGap: value(mobileSurface.sectionGap, surface.sectionGap),
    pageTop: value(mobileSurface.pageTop, spacing.xxl),
    pageBottom: value(mobileSurface.pageBottom, spacing.section),
    toolbarPadding: value(mobileSurface.toolbarPadding, spacing.md),
    navigation: {
      minimum: value(mobileNavigation.minimum, 64),
      icon: value(mobileNavigation.icon, 24),
      gap: value(mobileNavigation.gap, 4),
      padding: value(mobileNavigation.padding, 6),
    },
    control: {
      minimum: control.minimum,
      primary: value(controls.primary, control.primary),
      secondary: value(controls.secondary, control.secondary),
      icon: value(controls.icon, control.icon),
      paddingHorizontal: value(spacing.lg, spacing.xl),
      paddingVertical: value(controls.paddingVertical, spacing.md),
      inputMultiline: value(controls.inputMultiline, 140),
    },
  };
}

type Variant = keyof typeof type;
type TextMetrics = { fontSize: number; lineHeight: number; letterSpacing?: number };
export function responsiveText(variant: Variant, width: number, olderAdult: boolean, overrides: Partial<TextMetrics> = {}): TextMetrics {
  const desktopTokens = { ...type, ...(olderAdult ? herType : {}) };
  const base = desktopTokens[variant];
  const desktop = { ...base, ...overrides };
  const phoneTokens = olderAdult ? herMobileType : mobileType;
  // Older screens pass complete type tokens as styles; resolve those centrally too.
  const matches = (style: TextMetrics) => style.fontSize === desktop.fontSize && style.lineHeight === desktop.lineHeight;
  const keys = Object.keys(type) as Variant[];
  const token = matches(base) ? variant : keys.find(key => matches(type[key])) ?? keys.find(key => matches(desktopTokens[key]));
  const target = token ? phoneTokens[token] : {
    fontSize: desktop.fontSize < 15 ? desktop.fontSize : Math.max(phoneTokens.caption.fontSize,
      desktop.fontSize * (desktop.fontSize >= 28 ? phoneTokens.title.fontSize / desktopTokens.title.fontSize
        : desktop.fontSize >= 21 ? phoneTokens.section.fontSize / desktopTokens.section.fontSize
        : phoneTokens.body.fontSize / type.body.fontSize)),
    lineHeight: 0,
  };
  const phoneLineHeight = target.lineHeight || target.fontSize * Math.max(1.35, Math.min(1.5, desktop.lineHeight / desktop.fontSize));
  const desktopStyle = token ? desktopTokens[token] : desktop;
  return {
    fontSize: responsiveValue(target.fontSize, desktopStyle.fontSize, width),
    lineHeight: responsiveValue(phoneLineHeight, desktopStyle.lineHeight, width),
    letterSpacing: responsiveValue('letterSpacing' in target ? target.letterSpacing ?? desktop.letterSpacing ?? 0 : desktop.letterSpacing ?? 0,
      desktop.letterSpacing ?? 0, width),
  };
}
