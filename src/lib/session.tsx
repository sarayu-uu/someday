import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from './supabase';

export type Profile = { profile_id: string; pair_id: string; display_label: string };

type AuthStatus = 'loading' | 'ready' | 'error';

type SessionState = {
  authStatus: AuthStatus;
  retryAuth: () => void;
  // The acting profile. Remembered on this device so launches skip the picker.
  profile: Profile | null;
  chooseProfile: (profile: Profile) => void;
  forgetProfile: () => void;
};

const REMEMBERED_KEY = 'someday-jar:profile_id';

// Best-effort: storage can be unavailable (private window), the app still works.
export async function getRememberedProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REMEMBERED_KEY);
  } catch {
    return null;
  }
}

const Ctx = createContext<SessionState>({
  authStatus: 'loading',
  retryAuth: () => {},
  profile: null,
  chooseProfile: () => {},
  forgetProfile: () => {},
});

export const useSession = () => useContext(Ctx);

// Reuse a stored anonymous session if there is one, otherwise sign in silently.
async function ensureAnonymousSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) return true;
    const { data: signedIn, error } = await supabase.auth.signInAnonymously();
    if (error) console.warn('Anonymous sign-in failed:', error.message);
    return !error && !!signedIn.session;
  } catch (e) {
    console.warn('Anonymous sign-in threw:', e);
    return false;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setAuthStatus('loading');
    ensureAnonymousSession().then((ok) => {
      if (!cancelled) setAuthStatus(ok ? 'ready' : 'error');
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retryAuth = useCallback(() => setAttempt((n) => n + 1), []);

  const chooseProfile = useCallback((next: Profile) => {
    setProfile(next);
    AsyncStorage.setItem(REMEMBERED_KEY, next.profile_id).catch(() => {});
  }, []);

  const forgetProfile = useCallback(() => {
    setProfile(null);
    AsyncStorage.removeItem(REMEMBERED_KEY).catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{ authStatus, retryAuth, profile, chooseProfile, forgetProfile }}>{children}</Ctx.Provider>
  );
}
