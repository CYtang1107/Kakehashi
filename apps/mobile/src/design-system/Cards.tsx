import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { elevation, layout, radii, spacing, surface } from '../theme';
import { AppText } from './AppText';
import { AccessibleSwitch, Button, type ButtonProps } from './Controls';
import { useAccessibilityPreferences } from './preferences';
import { useResponsiveLayout } from './useResponsiveLayout';

export function Card({ children, style, tint, flat }: { children: React.ReactNode; style?: ViewStyle; tint?: boolean; flat?: boolean }) {
  const { palette, preferences } = useAccessibilityPreferences();
  const { width, cardPadding, contentGap } = useResponsiveLayout();
  return <View style={[{ minWidth: 0, maxWidth: '100%' }, flat ? { gap: spacing.md, paddingVertical: spacing.sm }
    : { backgroundColor: tint ? palette.secondary : palette.surface, borderRadius: radii.card,
      padding: width >= layout.wideMin ? surface.cardPaddingWide : cardPadding, gap: contentGap,
      borderWidth: preferences.highContrast ? 2 : 1, borderColor: preferences.highContrast ? palette.border : 'transparent',
      ...(tint || preferences.highContrast ? {} : elevation) }, style]}>{children}</View>;
}

type ContentCardProps = { title: string; description?: string; detail?: string; icon?: ButtonProps['icon']; action?: ButtonProps; children?: React.ReactNode };
function ContentCard({ title, description, detail, icon, action, children }: ContentCardProps) {
  const { palette } = useAccessibilityPreferences();
  return <Card>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
      {icon ? <View style={{ width: 48, height: 48, borderRadius: radii.control, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={24} color={palette.ai} accessible={false} />
      </View> : null}
      <View style={{ flex: 1, minWidth: 0, gap: spacing.sm }}>
        <AppText variant="section">{title}</AppText>
        {detail ? <AppText variant="caption">{detail}</AppText> : null}
      </View>
    </View>
    {description ? <AppText>{description}</AppText> : null}
    {children}
    {action ? <Button kind="secondary" {...action} /> : null}
  </Card>;
}
export const UpcomingVisitCard = (props: ContentCardProps) => <ContentCard {...props} icon="users" />;
export const MemoryCard = (props: ContentCardProps) => <ContentCard {...props} icon="image" />;
export const FriendRecommendationCard = (props: ContentCardProps) => <ContentCard {...props} icon="user-plus" />;
export const HomeAssistanceCard = (props: ContentCardProps) => <ContentCard {...props} icon="home" />;
export const ReminderCard = (props: ContentCardProps) => <ContentCard {...props} icon="bell" />;
export const SafetyCard = (props: ContentCardProps) => <ContentCard {...props} icon="shield" />;
export function DeviceControlCard({ value, onValueChange, controlLabel, ...props }: ContentCardProps & {
  value: boolean; onValueChange: (value: boolean) => void; controlLabel: string;
}) {
  return <ContentCard {...props} icon="sun"><AccessibleSwitch label={controlLabel} value={value} onValueChange={onValueChange} /></ContentCard>;
}
