import { STORAGE_KEYS } from '../../data/constants';
import { saveToStorage } from '../../utils/storage';

const SNAPSHOT_KEY = 'himalaya-customers';

function getConfig() {
  return {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  };
}

export function isCloudSyncConfigured() {
  const config = getConfig();
  return Boolean(config.url && config.anonKey);
}

function getHeaders() {
  const config = getConfig();
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  };
}

function getSnapshotUrl() {
  const config = getConfig();
  return `${config.url.replace(/\/$/, '')}/rest/v1/himalaya_snapshots`;
}

function updateStatus(status, message) {
  saveToStorage(STORAGE_KEYS.CLOUD_SYNC_STATUS, {
    status,
    message,
    updatedAt: new Date().toISOString(),
  });
}

export async function fetchCloudCustomers() {
  if (!isCloudSyncConfigured()) return null;

  try {
    const response = await fetch(`${getSnapshotUrl()}?snapshot_key=eq.${SNAPSHOT_KEY}&select=payload&limit=1`, {
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Cloud read failed');
    const rows = await response.json();
    const snapshot = rows && rows[0] ? rows[0] : null;
    updateStatus('synced', 'Cloud data loaded');
    return snapshot && snapshot.payload && Array.isArray(snapshot.payload.customers)
      ? snapshot.payload.customers
      : null;
  } catch (error) {
    updateStatus('error', error.message || 'Cloud read failed');
    return null;
  }
}

export async function syncCustomersToCloud(customers, csvMirror) {
  if (!isCloudSyncConfigured()) {
    updateStatus('local', 'Cloud sync is not configured');
    return false;
  }

  try {
    const response = await fetch(`${getSnapshotUrl()}?on_conflict=snapshot_key`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        snapshot_key: SNAPSHOT_KEY,
        payload: { customers },
        customers_csv: csvMirror.customersCsv,
        sales_csv: csvMirror.salesCsv,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Cloud sync failed');
    updateStatus('synced', 'Cloud and CSV mirror updated');
    return true;
  } catch (error) {
    updateStatus('error', error.message || 'Cloud sync failed');
    return false;
  }
}
