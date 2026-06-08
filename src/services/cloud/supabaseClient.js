const SESSION_KEY = 'hs_supabase_session';

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
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken() {
  const session = getStoredSession();
  return session && session.access_token;
}

function getHeaders(useUserToken = true) {
  const config = getConfig();
  const token = useUserToken ? getAccessToken() : null;
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
    throw new Error((body && (body.message || body.error_description || body.error)) || 'Supabase request failed');
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
  const response = await fetch(baseUrl(`/rest/v1${path}`), {
    ...options,
    headers: {
      ...getHeaders(options.useUserToken !== false),
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {}),
    },
  });
  return parseResponse(response);
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
