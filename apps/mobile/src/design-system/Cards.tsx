import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { elevation, radii, spacing } from '../theme';
import { AppText } from './AppText';
import { AccessibleSwitch, Button, type ButtonProps } from './Controls';
import { useAccessibilityPreferences } from './preferences';

export function Card({ children, style, tint, flat }: { children: React.ReactNode; style?: ViewStyle; tint?: boolean; flat?: boolean }) {
  const { palette, preferences } = useAccessibilityPreferences();
  return <View style={[flat ? { gap: spacing.md, paddingVertical: spacing.sm }
    : { backgroundColor: tint ? palette.secondary : palette.surface, borderRadius: radii.card, padding: spacing.xl, gap: spacing.lg,
      borderWidth: preferences.highContrast ? 2 : 1, borderColor: preferences.highContrast ? palette.border : tint ? 'transparent' : palette.separator,
      ...(tint || preferences.highContrast ? {} : elevation) }, style]}>{children}</View>;
}

type ContentCardProps = { title: string; description?: string; detail?: string; icon?: ButtonProps['icon']; action?: ButtonProps; children?: React.ReactNode };
function ContentCard({ title, description, detail, icon, action, children }: ContentCardProps) {
  const { palette, olderAdult } = useAccessibilityPreferences();
  const tint = !olderAdult ? palette.secondary : icon === 'users' || icon === 'bell' ? palette.accent
    : icon === 'user-plus' ? palette.mossTint : icon === 'home' ? palette.kakiTint : palette.plumTint;
  const iconColor = !olderAdult ? palette.primary : icon === 'user-plus' ? palette.moss : icon === 'home' ? palette.kaki : palette.ai;
  return <Card>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
      {icon ? <View style={{ width: 48, height: 48, borderRadius: radii.control, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={24} color={iconColor} accessible={false} />
      </View> : null}
      <View style={{ flex: 1, gap: spacing.sm }}>
        <AppText variant="section">{title}</AppText>
        {detail ? <AppText variant="caption">{detail}</AppText> : null}
      </View>
    </View>
    {description ? <AppText>{description}</AppText> : null}
    {children}
    {action ? <Button {...action} /> : null}
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
