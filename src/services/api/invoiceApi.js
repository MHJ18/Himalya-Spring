import { dbRequest, isSupabaseConfigured } from '../cloud/supabaseClient';
import { DEFAULT_SETTINGS } from '../../data/constants';
import { generateInvoiceNumber } from '../../utils/invoiceNumber';
import { getCurrentAdmin } from '../../utils/adminAuth';

function buildInvoicePayload(customer, historyItems, company) {
  const admin = getCurrentAdmin() || {};
  const totalAmount = historyItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const totalQty = historyItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return {
    company: {
      name: company.businessName || DEFAULT_SETTINGS.businessName,
      phone: company.businessPhone || DEFAULT_SETTINGS.businessPhone,
      address: company.businessAddress || DEFAULT_SETTINGS.businessAddress,
    },
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
    },
    preparedBy: {
      name: admin.name || 'Himaliya Admin',
      email: admin.email || '',
      role: admin.role || 'Owner',
    },
    history: historyItems.map((item) => ({
      date: item.date,
      bottleType: item.bottleType,
      quantity: Number(item.quantity) || 0,
      pricePerBottle: Number(item.pricePerBottle) || 0,
      totalAmount: Number(item.totalAmount) || 0,
    })),
    summary: {
      entryCount: historyItems.length,
      totalAmount,
      totalQty,
    },
  };
}

export const invoiceApi = {
  async createFromCustomer(customer, historyItems, company = DEFAULT_SETTINGS) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is required to create invoices.');
    }

    const payload = buildInvoicePayload(customer, historyItems, company);
    const invoiceNumber = generateInvoiceNumber();

    const rows = await dbRequest('/customer_invoices', {
      method: 'POST',
      body: JSON.stringify([{
        customer_id: customer.id,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        payload,
        total_amount: payload.summary.totalAmount,
        total_qty: payload.summary.totalQty,
      }]),
    });

    const row = rows && rows[0];
    return {
      id: row && row.id,
      invoiceNumber,
      invoiceDate: row && row.invoice_date,
      payload,
      totalAmount: payload.summary.totalAmount,
      totalQty: payload.summary.totalQty,
    };
  },

  async lookupByNumber(invoiceNumber) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is required to look up invoices.');
    }

    const normalized = String(invoiceNumber || '').trim();
    if (!normalized) return null;

    return dbRequest('/rpc/lookup_invoice_by_number', {
      method: 'POST',
      useUserToken: false,
      body: JSON.stringify({ p_invoice_number: normalized }),
    });
  },
};
