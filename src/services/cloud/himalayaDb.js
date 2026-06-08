import { dbRequest, isSupabaseConfigured } from './supabaseClient';
import { DEFAULT_SETTINGS } from '../../data/constants';

function toCustomer(row, sales) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address || '',
    email: row.email || '',
    photo: row.photo || '',
    createdAt: row.created_at,
    purchaseHistory: sales
      .filter((sale) => sale.customer_id === row.id)
      .map((sale) => ({
        id: sale.id,
        date: sale.created_at,
        bottleType: sale.bottle_type,
        quantity: Number(sale.quantity) || 0,
        pricePerBottle: Number(sale.price_per_bottle) || 0,
        totalAmount: Number(sale.total_amount) || 0,
        notes: sale.notes || '',
      })),
  };
}

function toCustomerRow(customer) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    address: customer.address || '',
    email: customer.email || '',
    photo: customer.photo || '',
    created_at: customer.createdAt || new Date().toISOString(),
  };
}

function toSaleRow(customer, sale) {
  return {
    id: sale.id,
    customer_id: customer.id,
    bottle_type: sale.bottleType,
    quantity: Number(sale.quantity) || 0,
    price_per_bottle: Number(sale.pricePerBottle) || 0,
    total_amount: Number(sale.totalAmount) || 0,
    notes: sale.notes || '',
    created_at: sale.date || new Date().toISOString(),
  };
}

export async function getCloudCustomers() {
  if (!isSupabaseConfigured()) return null;
  const customers = await dbRequest('/customers?select=*&order=created_at.asc');
  const sales = await dbRequest('/sales?select=*&order=created_at.asc');
  return customers.map((customer) => toCustomer(customer, sales));
}

export async function saveCloudCustomers(customers) {
  if (!isSupabaseConfigured()) return false;
  const customerRows = customers.map(toCustomerRow);
  const saleRows = customers.flatMap((customer) =>
    (customer.purchaseHistory || []).map((sale) => toSaleRow(customer, sale))
  );

  if (customerRows.length) {
    await dbRequest('/customers?on_conflict=id', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: JSON.stringify(customerRows),
    });
  }

  if (saleRows.length) {
    await dbRequest('/sales?on_conflict=id', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: JSON.stringify(saleRows),
    });
  }

  return true;
}

export async function getCloudSettings() {
  if (!isSupabaseConfigured()) return null;
  const rows = await dbRequest('/app_settings?id=eq.main&select=payload&limit=1');
  return rows && rows[0] && rows[0].payload ? rows[0].payload : null;
}

export async function saveCloudSettings(settings) {
  if (!isSupabaseConfigured()) return false;
  await dbRequest('/app_settings?on_conflict=id', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify({
      id: 'main',
      payload: { ...DEFAULT_SETTINGS, ...settings },
      updated_at: new Date().toISOString(),
    }),
  });
  return true;
}

export async function getCloudBottlePrices() {
  if (!isSupabaseConfigured()) return null;
  const rows = await dbRequest('/bottle_prices?select=*&order=bottle_type.asc');
  return rows.reduce((acc, row) => ({ ...acc, [row.bottle_type]: row.price }), {});
}

export async function saveCloudBottlePrices(prices) {
  if (!isSupabaseConfigured()) return false;
  const rows = Object.keys(prices).map((type) => ({
    bottle_type: type,
    price: Number(prices[type]) || 0,
    updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return true;
  await dbRequest('/bottle_prices?on_conflict=bottle_type', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=minimal',
    body: JSON.stringify(rows),
  });
  return true;
}
