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

export function getAdmins() {
  try {
    const admins = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
    if (admins.length) return admins;
  } catch {
    // Fall through and reseed if local storage is malformed.
  }

  localStorage.setItem(ADMINS_KEY, JSON.stringify([defaultAdmin]));
  return [defaultAdmin];
}

export function findAdminByCredentials(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  return getAdmins().find(
    (admin) => admin.email.toLowerCase() === normalizedEmail && admin.password === password,
  ) || null;
}

export function createAdmin(admin) {
  const admins = getAdmins();
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

export function deleteAdminWithOwnerPassword(adminId, ownerPassword) {
  const admins = getAdmins();
  const adminToDelete = admins.find((admin) => admin.id === adminId);
  const owner = admins.find((admin) => admin.role === 'Owner' && admin.password === ownerPassword);

  if (!adminToDelete) {
    throw new Error('Admin not found.');
  }

  if (!owner) {
    throw new Error('Owner password is incorrect.');
  }

  if (admins.length <= 1) {
    throw new Error('At least one admin must remain.');
  }

  const owners = admins.filter((admin) => admin.role === 'Owner');
  if (adminToDelete.role === 'Owner' && owners.length <= 1) {
    throw new Error('At least one owner must remain.');
  }

  const nextAdmins = admins.filter((admin) => admin.id !== adminId);
  localStorage.setItem(ADMINS_KEY, JSON.stringify(nextAdmins));
  return nextAdmins;
}

export function setCurrentAdmin(admin) {
  localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify({
    id: admin.id,
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
}
