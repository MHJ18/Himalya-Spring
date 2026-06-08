import {
  clearStoredSession,
  dbRequest,
  getStoredSession,
  isSupabaseConfigured,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  storeSession,
  verifyPassword,
} from '../services/cloud/supabaseClient';

const ADMINS_KEY = 'hs_admin_users';
const CURRENT_ADMIN_KEY = 'hs_current_admin';

export const defaultAdmin = {
  id: 'default-admin',
  name: 'Himaliya Admin',
  email: 'admin@himaliya.com',
  password: 'admin123',
  role: 'Owner',
  createdAt: 'seed',
};

function localAdmins() {
  try {
    const admins = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
    if (admins.length) return admins;
  } catch {
    // Reseed local fallback below.
  }
  localStorage.setItem(ADMINS_KEY, JSON.stringify([defaultAdmin]));
  return [defaultAdmin];
}

function toAdmin(row) {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    name: row.name,
    email: row.email,
    role: row.role || 'Admin',
    active: row.active !== false,
    createdAt: row.created_at,
  };
}

export async function getAdmins() {
  if (!isSupabaseConfigured()) return localAdmins();
  const rows = await dbRequest('/admin_profiles?select=*&order=created_at.asc');
  return rows.map(toAdmin);
}

export async function findAdminByCredentials(email, password) {
  if (!isSupabaseConfigured()) {
    const normalizedEmail = email.trim().toLowerCase();
    return localAdmins().find(
      (admin) => admin.email.toLowerCase() === normalizedEmail && admin.password === password,
    ) || null;
  }

  const session = await signInWithPassword(email.trim().toLowerCase(), password);
  const userId = session.user && session.user.id;
  const rows = await dbRequest(
    `/admin_profiles?auth_user_id=eq.${userId}&active=eq.true&select=*&limit=1`
  );
  const admin = rows && rows[0] ? toAdmin(rows[0]) : null;
  if (!admin) {
    await signOut();
    throw new Error('Your account is not allowed to access this dashboard.');
  }
  setCurrentAdmin(admin);
  return admin;
}

export async function createAdmin(admin) {
  if (!isSupabaseConfigured()) {
    const admins = localAdmins();
    const normalizedEmail = admin.email.trim().toLowerCase();
    if (admins.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An admin with this email already exists.');
    }
    const nextAdmin = {
      id: `admin-${Date.now()}`,
      name: admin.name.trim(),
      email: normalizedEmail,
      password: admin.password,
      role: admin.role || 'Admin',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(ADMINS_KEY, JSON.stringify([...admins, nextAdmin]));
    return nextAdmin;
  }

  const email = admin.email.trim().toLowerCase();
  const signUpResult = await signUpWithPassword(email, admin.password);
  const authUserId = signUpResult.user && signUpResult.user.id;
  if (!authUserId) throw new Error('Could not create Supabase auth user.');

  const rows = await dbRequest('/admin_profiles?on_conflict=auth_user_id', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    body: JSON.stringify({
      auth_user_id: authUserId,
      name: admin.name.trim(),
      email,
      role: admin.role || 'Admin',
      active: true,
    }),
  });
  return toAdmin(rows[0]);
}

export async function deleteAdminWithOwnerPassword(adminId, ownerPassword) {
  if (!isSupabaseConfigured()) {
    const admins = localAdmins();
    const adminToDelete = admins.find((admin) => admin.id === adminId);
    const owner = admins.find((admin) => admin.role === 'Owner' && admin.password === ownerPassword);
    if (!adminToDelete) throw new Error('Admin not found.');
    if (!owner) throw new Error('Owner password is incorrect.');
    if (admins.length <= 1) throw new Error('At least one admin must remain.');
    const owners = admins.filter((admin) => admin.role === 'Owner');
    if (adminToDelete.role === 'Owner' && owners.length <= 1) throw new Error('At least one owner must remain.');
    const nextAdmins = admins.filter((admin) => admin.id !== adminId);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(nextAdmins));
    return nextAdmins;
  }

  const admins = await getAdmins();
  const adminToDelete = admins.find((admin) => admin.id === adminId);
  if (!adminToDelete) throw new Error('Admin not found.');
  if (admins.length <= 1) throw new Error('At least one admin must remain.');
  const owners = admins.filter((admin) => admin.role === 'Owner');
  if (adminToDelete.role === 'Owner' && owners.length <= 1) throw new Error('At least one owner must remain.');

  const owner = owners[0];
  const currentSession = getStoredSession();
  await verifyPassword(owner.email, ownerPassword);
  if (currentSession) storeSession(currentSession);

  await dbRequest(`/admin_profiles?id=eq.${adminId}`, {
    method: 'DELETE',
    prefer: 'return=minimal',
  });
  return getAdmins();
}

export function setCurrentAdmin(admin) {
  localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify({
    id: admin.id,
    authUserId: admin.authUserId,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  }));
}

export function getCurrentAdmin() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_ADMIN_KEY));
  } catch {
    return null;
  }
}

export function clearCurrentAdmin() {
  localStorage.removeItem(CURRENT_ADMIN_KEY);
  clearStoredSession();
}
