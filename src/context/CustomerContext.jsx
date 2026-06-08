import React, {
  createContext, useContext, useReducer, useEffect, useCallback, useMemo,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { customerApi } from '../services/api/customerApi';
import { generateSeedData } from '../services/mock/seedData';
import { normalizePhone } from '../utils/validation';

const CustomerContext = createContext(null);

const initialState = { customers: [], loading: true };

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { customers: action.payload, loading: false };
    case 'SET':
      return { ...state, customers: action.payload };
    default:
      return state;
  }
}

export function CustomerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    customerApi.getAll().then((data) => {
      let customers = data || [];
      if (!localStorage.getItem('ws_seeded_v2') && customers.length === 0) {
        customers = generateSeedData();
        customerApi.saveAll(customers);
        localStorage.setItem('ws_seeded_v2', '1');
      }
      dispatch({ type: 'LOAD', payload: customers });
    });
  }, []);

  const persist = useCallback(async (customers) => {
    await customerApi.saveAll(customers);
    dispatch({ type: 'SET', payload: customers });
  }, []);

  const addCustomer = useCallback(async (form) => {
    const phone = normalizePhone(form.phone);
    if (state.customers.some((c) => c.phone === phone)) {
      throw new Error('A customer with this phone number already exists');
    }
    const customer = {
      id: uuidv4(),
      name: form.name.trim(),
      phone,
      address: form.address.trim(),
      email: (form.email || '').trim(),
      photo: form.photo || '',
      createdAt: new Date().toISOString(),
      purchaseHistory: [],
    };
    await persist([...state.customers, customer]);
    return customer;
  }, [state.customers, persist]);

  const findByPhone = useCallback((phone) => {
    const n = normalizePhone(phone);
    return state.customers.find((c) => c.phone === n);
  }, [state.customers]);

  const searchCustomers = useCallback((query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return state.customers;
    const phoneDigits = q.replace(/\D/g, '');
    return state.customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (phoneDigits && c.phone.includes(phoneDigits))
    );
  }, [state.customers]);

  const addTransaction = useCallback(async (customerId, transaction) => {
    const updated = state.customers.map((c) =>
      c.id === customerId
        ? { ...c, purchaseHistory: [...(c.purchaseHistory || []), transaction] }
        : c
    );
    await persist(updated);
    return transaction;
  }, [state.customers, persist]);

  const value = useMemo(() => ({
    customers: state.customers,
    loading: state.loading,
    addCustomer,
    findByPhone,
    searchCustomers,
    addTransaction,
    refresh: () => customerApi.getAll().then((d) => dispatch({ type: 'SET', payload: d })),
  }), [state, addCustomer, findByPhone, searchCustomers, addTransaction]);

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomers() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers requires CustomerProvider');
  return ctx;
}
