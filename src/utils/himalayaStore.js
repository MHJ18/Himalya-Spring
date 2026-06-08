const CUSTOMERS_KEY = 'himalaya_customers';
const SETTINGS_KEY = 'himalaya_settings';

const bottlePrices = {
  '19L Bottle': 250,
  '12L Bottle': 170,
  '1.5L Bottle Pack': 420,
  '500ml Bottle Pack': 360,
};

const seedCustomers = [
  {
    id: 'c-1',
    name: 'Ahmed Khan',
    phone: '+923001234567',
    address: 'Street 12, Blue Area, Islamabad',
    createdAt: '2026-05-08T09:00:00.000Z',
    purchaseHistory: [
      createTransaction('19L Bottle', 4, 250, '2026-06-07T10:30:00.000Z'),
      createTransaction('12L Bottle', 2, 170, '2026-05-28T11:00:00.000Z'),
    ],
  },
  {
    id: 'c-2',
    name: 'Fatima Ali',
    phone: '+923331112222',
    address: 'House 44, Model Town, Lahore',
    createdAt: '2026-05-12T09:00:00.000Z',
    purchaseHistory: [
      createTransaction('19L Bottle', 3, 250, '2026-06-06T14:15:00.000Z'),
    ],
  },
  {
    id: 'c-3',
    name: 'Usman Sheikh',
    phone: '+923455556666',
    address: 'Plot 7, Gulshan-e-Iqbal, Karachi',
    createdAt: '2026-05-19T09:00:00.000Z',
    purchaseHistory: [
      createTransaction('500ml Bottle Pack', 5, 360, '2026-06-02T08:45:00.000Z'),
    ],
  },
];

function createTransaction(bottleType, quantity, pricePerBottle, date = new Date().toISOString(), notes = '') {
  const qty = Number(quantity);
  const price = Number(pricePerBottle);
  return {
    id: `t-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date,
    bottleType,
    quantity: qty,
    pricePerBottle: price,
    totalAmount: qty * price,
    notes,
  };
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCustomers() {
  const existing = readJson(CUSTOMERS_KEY, null);
  if (existing) return existing;
  writeJson(CUSTOMERS_KEY, seedCustomers);
  return seedCustomers;
}

export function saveCustomers(customers) {
  writeJson(CUSTOMERS_KEY, customers);
}

export function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return `+${digits}`;
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
  if (digits.length === 10) return `+92${digits}`;
  return value;
}

export function searchCustomers(query) {
  const q = String(query || '').trim().toLowerCase();
  const digits = q.replace(/\D/g, '');
  if (!q) return getCustomers();
  return getCustomers().filter((customer) => (
    customer.name.toLowerCase().includes(q) ||
    customer.phone.toLowerCase().includes(q) ||
    customer.phone.replace(/\D/g, '').includes(digits)
  ));
}

export function addCustomer(form) {
  const customers = getCustomers();
  const phone = normalizePhone(form.phone);
  if (customers.some((customer) => customer.phone === phone)) {
    throw new Error('Customer with this phone number already exists');
  }
  const customer = {
    id: `c-${Date.now()}`,
    name: form.name.trim(),
    phone,
    address: form.address.trim(),
    createdAt: new Date().toISOString(),
    purchaseHistory: [],
  };
  saveCustomers([...customers, customer]);
  return customer;
}

export function recordSale(customerId, sale) {
  const customers = getCustomers();
  const transaction = createTransaction(
    sale.bottleType,
    sale.quantity,
    sale.pricePerBottle,
    new Date().toISOString(),
    sale.notes
  );
  saveCustomers(customers.map((customer) => (
    customer.id === customerId
      ? { ...customer, purchaseHistory: [...(customer.purchaseHistory || []), transaction] }
      : customer
  )));
  return transaction;
}

export function getAnalytics() {
  const customers = getCustomers();
  const now = new Date();
  const today = now.toDateString();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const transactions = customers.flatMap((customer) => (
    (customer.purchaseHistory || []).map((transaction) => ({
      ...transaction,
      customerId: customer.id,
      customerName: customer.name,
    }))
  ));
  const todayTransactions = transactions.filter((transaction) => new Date(transaction.date).toDateString() === today);
  const monthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  return {
    customers,
    transactions,
    todayTransactions,
    monthTransactions,
    revenueThisMonth: sum(monthTransactions, 'totalAmount'),
    bottlesSoldToday: sum(todayTransactions, 'quantity'),
    activeCustomers: new Set(monthTransactions.map((transaction) => transaction.customerId)).size,
    totalCustomers: customers.length,
  };
}

export function getSettings() {
  return readJson(SETTINGS_KEY, {
    businessName: 'Himaliya Spring Water',
    businessPhone: '+923001234567',
    businessAddress: 'Main distribution office',
  });
}

export function saveSettings(settings) {
  writeJson(SETTINGS_KEY, settings);
}

export function clearHimalayaData() {
  localStorage.removeItem(CUSTOMERS_KEY);
}

export { bottlePrices };

function sum(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}
