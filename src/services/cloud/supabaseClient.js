const SESSION_KEY = 'hs_supabase_session';
const SESSION_EXPIRED_EVENT = 'hs:session-expired';
const SESSION_READY_EVENT = 'hs:session-ready';
let sessionExpiryNotified = false;

function notifySessionExpired() {
  if (sessionExpiryNotified) return;
  sessionExpiryNotified = true;
  clearStoredSession();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

export function getSessionExpiredEventName() {
  return SESSION_EXPIRED_EVENT;
}

export function getSessionReadyEventName() {
  return SESSION_READY_EVENT;
}

function getConfig() {
  return {
    url: process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function isSupabaseConfigured() {
  const config = getConfig();
  return Boolean(config.url && config.anonKey);
}

function baseUrl(path) {
  const config = getConfig();
  return `${config.url.replace(/\/$/, '')}${path}`;
}

export function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function storeSession(session) {
  sessionExpiryNotified = false;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(SESSION_READY_EVENT));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken() {
  const session = getStoredSession();
  return session && session.access_token;
}

export function hasStoredSession() {
  const session = getStoredSession();
  return Boolean(session && session.access_token && session.refresh_token);
}

async function getFreshSession() {
  const session = getStoredSession();
  if (!session || !session.refresh_token) {
    notifySessionExpired();
    throw new Error('Your session has expired. Please sign in again.');
  }
  const expiresAt = Number(session.expires_at || 0) * 1000;
  if (!expiresAt || expiresAt - Date.now() > 60000) return session;
  try {
    const refreshed = await authRequest('/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    storeSession(refreshed);
    return refreshed;
  } catch {
    notifySessionExpired();
    throw new Error('Your session has expired. Please sign in again.');
  }
}

async function getHeaders(useUserToken = true) {
  const config = getConfig();
  const session = useUserToken ? await getFreshSession() : null;
  const token = session && session.access_token;
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${token || config.anonKey}`,
    'Content-Type': 'application/json',
  };
}

async function parseResponse(response) {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const description = body && (body.msg || body.message || body.error_description || body.error);
    const error = new Error(description || 'Supabase request failed');
    error.status = response.status;
    error.code = body && (body.error_code || body.error);
    throw error;
  }
  return body;
}

export async function authRequest(path, options = {}) {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured');
  const config = getConfig();
  const response = await fetch(baseUrl(`/auth/v1${path}`), {
    ...options,
    headers: {
      apikey: config.anonKey,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return parseResponse(response);
}

export async function dbRequest(path, options = {}) {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured');
  try {
    const response = await fetch(baseUrl(`/rest/v1${path}`), {
      ...options,
      headers: {
        ...(await getHeaders(options.useUserToken !== false)),
        Prefer: options.prefer || 'return=representation',
        ...(options.headers || {}),
      },
    });
    return await parseResponse(response);
  } catch (error) {
    if (error.status === 401) notifySessionExpired();
    throw error;
  }
}

export async function signInWithPassword(email, password) {
  const session = await authRequest('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  storeSession(session);
  return session;
}

export async function signUpWithPassword(email, password) {
  return authRequest('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function verifyPassword(email, password) {
  return authRequest('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signOut() {
  const token = getAccessToken();
  if (token) {
    try {
      await authRequest('/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Local sign-out should still succeed if the session is already expired.
    }
  }
  clearStoredSession();
}
