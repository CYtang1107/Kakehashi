import React, { createContext, useContext, useState } from 'react';
import { AppText, Button, Card, Screen, StatusBanner, AccessibleTextInput } from './ui';
import { useI18n, type Key } from './i18n';

export type Role = 'her' | 'family' | 'student' | 'worker';
type User = { email: string; role: Role };
type AuthContext = { user: User | null; signIn: (email: string, password: string, role: Role) => boolean; signUp: (email: string, password: string, role: Role) => boolean; googleSignIn: (role: Role) => void; signOut: () => void };

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
  const googleSignIn = (role: Role) => setUser({ email: 'google-demo@example.com', role });
  return <AuthCtx.Provider value={{ user, signIn, signUp, googleSignIn, signOut: () => setUser(null) }}>{children}</AuthCtx.Provider>;
}

export function LoginScreen({ role }: { role: Role }) {
  const { t } = useI18n();
  const { signIn, signUp, googleSignIn } = useAuth();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('demo@gmail.com');
  const [password, setPassword] = useState('12345');
  const [error, setError] = useState(false);
  const submit = () => {
    const ok = signup ? signUp(email, password, role) : signIn(email, password, role);
    setError(!ok);
  };
  return <Screen requiresHome={false} back header={{ title: t(signup ? 'authSignup' : 'authLogin') }}>
    <Card style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 20 }}>
      <AppText>{t('authRoleLead', { role: t(`role${role[0].toUpperCase()}${role.slice(1)}` as Key) })}</AppText>
      <AccessibleTextInput label={t('authEmail')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <AccessibleTextInput label={t('authPassword')} value={password} onChangeText={setPassword} secureTextEntry />
      {!signup ? <AppText variant="caption">{t('authDemo')}</AppText> : null}
      {error ? <StatusBanner tone="error" title={t(signup ? 'authSignupError' : 'authLoginError')} /> : null}
      <Button label={t(signup ? 'authSignup' : 'authLogin')} icon="log-in" onPress={submit} />
      <Button label={t('authGoogle')} icon="globe" kind="secondary" onPress={() => googleSignIn(role)} />
      <Button label={t(signup ? 'authHaveAccount' : 'authNeedAccount')} kind="secondary" onPress={() => { setSignup(value => !value); setError(false); }} />
    </Card>
  </Screen>;
}

export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === role ? <>{children}</> : <LoginScreen role={role} />;
}
