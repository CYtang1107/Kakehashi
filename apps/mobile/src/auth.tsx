import React, { createContext, useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AppText, Button, Card, Screen, StatusBanner, AccessibleTextInput, SectionTabs } from './ui';
import { useAccessibilityPreferences } from './design-system/preferences';
import { control, radii, spacing } from './theme';
import { useI18n, type Key } from './i18n';

export type Role = 'her' | 'family' | 'student' | 'worker';
type User = { email: string; role: Role };
type AuthContext = { user: User | null; signIn: (email: string, password: string, role: Role) => boolean; signUp: (email: string, password: string, role: Role) => boolean; demoSignIn: (provider: 'google' | 'apple' | 'phone', role: Role) => void; signOut: () => void };

const AuthCtx = createContext<AuthContext>(null as unknown as AuthContext);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const signIn = (email: string, password: string, role: Role) => {
    if (email.trim().toLowerCase() !== 'demo@gmail.com' || password !== '12345') return false;
    setUser({ email: email.trim(), role });
    return true;
  };
  const signUp = (email: string, password: string, role: Role) => {
    if (!email.trim() || password.length < 5) return false;
    setUser({ email: email.trim(), role });
    return true;
  };
  const demoSignIn: AuthContext['demoSignIn'] = (provider, role) => setUser({ email: `${provider}-demo@example.com`, role });
  return <AuthCtx.Provider value={{ user, signIn, signUp, demoSignIn, signOut: () => setUser(null) }}>{children}</AuthCtx.Provider>;
}

function AuthMethod({ icon, label, onPress }: { icon: 'google' | 'apple' | 'phone'; label: string; onPress: () => void }) {
  const { palette, preferences } = useAccessibilityPreferences();
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => ({ minHeight: control.secondary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
      flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderRadius: radii.control,
      backgroundColor: pressed ? palette.controlPressed : palette.surface,
      borderWidth: preferences.highContrast || focused ? 2 : 1, borderColor: focused ? palette.focus : preferences.highContrast ? palette.border : palette.separator })}>
    <FontAwesome name={icon} size={24} color={palette.ink} accessible={false} />
    <AppText variant="button" style={{ flex: 1, textAlign: 'center' }}>{label}</AppText>
    <View style={{ width: 24 }} />
  </Pressable>;
}

export function LoginScreen({ role }: { role: Role }) {
  const { t } = useI18n();
  const { palette } = useAccessibilityPreferences();
  const { signIn, signUp, demoSignIn } = useAuth();
  const [signup, setSignup] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('demo@gmail.com');
  const [password, setPassword] = useState('12345');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const roleLabels: Record<Role, Key> = { her: 'roleHer', family: 'roleFamily', student: 'roleStudents', worker: 'roleHelpers' };
  const submit = () => {
    if (method === 'phone') {
      if (!/^\+[1-9]\d{6,14}$/.test(phone.replace(/[ ()-]/g, '')) || code.trim() !== '123456') { setError(true); return; }
      demoSignIn('phone', role);
      return;
    }
    const ok = signup ? signUp(email, password, role) : signIn(email, password, role);
    setError(!ok);
  };
  return <Screen requiresHome={false} back roleSwitch={false}>
    <Card style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        <AppText variant="eyebrow">{t(roleLabels[role])}</AppText>
        <AppText variant="title">{t(signup ? 'authSignup' : 'authLogin')}</AppText>
        <AppText variant="caption">{t('authRoleLead', { role: t(roleLabels[role]) })}</AppText>
      </View>
      <SectionTabs label={t('authMethods')} value={signup ? 'signup' : 'login'} options={[["login", t('authLogin')], ["signup", t('authSignup')]]}
        onChange={value => { setSignup(value === 'signup'); setError(false); }} />
      <View style={{ gap: spacing.lg }}>
        {method === 'email' ? <>
          <AccessibleTextInput label={t('authEmail')} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
            keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
          <AccessibleTextInput label={t('authPassword')} value={password} onChangeText={setPassword} secureTextEntry
            autoComplete={signup ? 'new-password' : 'current-password'} textContentType={signup ? 'newPassword' : 'password'} onSubmitEditing={submit} />
          {!signup ? <AppText variant="caption">{t('authDemo')}</AppText> : null}
        </> : <>
          <AppText variant="caption">{t('authPhoneDemo')}</AppText>
          <AccessibleTextInput label={t('authPhoneNumber')} hint={t('authPhoneHint')} value={phone} onChangeText={setPhone}
            keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={30} />
          <AccessibleTextInput label={t('authPhoneCode')} value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} onSubmitEditing={submit} />
        </>}
        {error ? <StatusBanner tone="error" title={t(method === 'phone' ? 'authPhoneError' : signup ? 'authSignupError' : 'authLoginError')} /> : null}
        <Button label={t(method === 'phone' ? 'authPhoneContinue' : signup ? 'authSignup' : 'authLogin')} onPress={submit} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1, height: 1, backgroundColor: palette.separator }} />
        <AppText variant="caption">{t('authAlternative')}</AppText>
        <View style={{ flex: 1, height: 1, backgroundColor: palette.separator }} />
      </View>
      <View style={{ gap: spacing.md }}>
        <AuthMethod icon="google" label={t('authGoogle')} onPress={() => demoSignIn('google', role)} />
        <AuthMethod icon="apple" label={t('authApple')} onPress={() => demoSignIn('apple', role)} />
        {method === 'email' ? <AuthMethod icon="phone" label={t('authPhone')} onPress={() => { setMethod('phone'); setError(false); }} />
          : <Button label={t('authEmailMethod')} icon="mail" kind="secondary" onPress={() => { setMethod('email'); setError(false); }} />}
      </View>
      <AppText variant="caption">{t('authPrototype')}</AppText>
    </Card>
  </Screen>;
}

export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === role ? <>{children}</> : <LoginScreen role={role} />;
}
