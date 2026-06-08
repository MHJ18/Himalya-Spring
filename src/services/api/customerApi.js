import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../data/constants';
import { buildCustomersCsv, buildSalesCsv } from '../../utils/exportCsv';
import { fetchCloudCustomers, syncCustomersToCloud } from '../cloud/supabaseSync';

function saveCsvMirror(customers) {
  const customersCsv = buildCustomersCsv(customers);
  const salesCsv = buildSalesCsv(customers);
  saveToStorage(STORAGE_KEYS.CUSTOMERS_CSV, customersCsv);
  saveToStorage(STORAGE_KEYS.SALES_CSV, salesCsv);
  return { customersCsv, salesCsv };
}

export const customerApi = {
  async getAll() {
    const cloudCustomers = await fetchCloudCustomers();
    if (cloudCustomers) {
      saveToStorage(STORAGE_KEYS.CUSTOMERS, cloudCustomers);
      saveCsvMirror(cloudCustomers);
      return cloudCustomers;
    }
    const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
    saveCsvMirror(customers);
    return customers;
  },
  async saveAll(customers) {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    const csvMirror = saveCsvMirror(customers);
    await syncCustomersToCloud(customers, csvMirror);
    return customers;
  },
};
