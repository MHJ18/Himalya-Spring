import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../data/constants';
import { buildCustomersCsv, buildSalesCsv } from '../../utils/exportCsv';
import { getCloudCustomers, saveCloudCustomers } from '../cloud/himalayaDb';
import { syncCustomersToCloud } from '../cloud/supabaseSync';

function saveCsvMirror(customers) {
  const customersCsv = buildCustomersCsv(customers);
  const salesCsv = buildSalesCsv(customers);
  saveToStorage(STORAGE_KEYS.CUSTOMERS_CSV, customersCsv);
  saveToStorage(STORAGE_KEYS.SALES_CSV, salesCsv);
  return { customersCsv, salesCsv };
}

export const customerApi = {
  async getAll() {
    try {
      const cloudCustomers = await getCloudCustomers();
      if (cloudCustomers) {
        saveToStorage(STORAGE_KEYS.CUSTOMERS, cloudCustomers);
        saveCsvMirror(cloudCustomers);
        return cloudCustomers;
      }
    } catch {
      // Local data remains available if Supabase tables are not created yet.
    }
    const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
    saveCsvMirror(customers);
    return customers;
  },
  async saveAll(customers) {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    const csvMirror = saveCsvMirror(customers);
    try {
      await saveCloudCustomers(customers);
    } catch {
      await syncCustomersToCloud(customers, csvMirror);
    }
    return customers;
  },
};
