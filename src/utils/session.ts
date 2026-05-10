import { buildApiUrl } from './api';

const STORAGE_KEY = 'mindora_auth_session_v1';

export type AppUser = {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
};

export type StoredSession = {
  access_token: string;
  user: AppUser;
};

function readRaw(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.access_token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getStoredSession(): StoredSession | null {
  return readRaw();
}

export function setStoredSession(session: StoredSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** Same shape as `supabase.auth.getSession()` for minimal component churn */
export async function getSession(): Promise<{
  data: { session: { access_token: string; user: AppUser } | null };
}> {
  const s = readRaw();
  return { data: { session: s ? { access_token: s.access_token, user: s.user } : null } };
}

export async function signOut(): Promise<void> {
  setStoredSession(null);
}

export async function signInWithPassword(email: string, password: string): Promise<StoredSession> {
  const res = await fetch(buildApiUrl('login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Sign in failed');
  }
  const session: StoredSession = { access_token: data.access_token, user: data.user };
  setStoredSession(session);
  return session;
}

export async function signUp(email: string, password: string, name: string): Promise<StoredSession> {
  const res = await fetch(buildApiUrl('signup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Sign up failed');
  }
  if (!data.access_token || !data.user) {
    throw new Error('Sign up did not return a session');
  }
  const session: StoredSession = { access_token: data.access_token, user: data.user };
  setStoredSession(session);
  return session;
}
