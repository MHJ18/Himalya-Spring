import React, {
  createContext, useContext, useReducer, useEffect, useCallback, useMemo,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { customerApi } from '../services/api/customerApi';
import { normalizePhone } from '../utils/validation';
import { getSessionReadyEventName, hasStoredSession } from '../services/cloud/supabaseClient';

const CustomerContext = createContext(null);

const initialState = { customers: [], loading: true, error: '' };

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { customers: action.payload, loading: false, error: '' };
    case 'ERROR':
      return { customers: [], loading: false, error: action.payload };
    case 'SET':
      return { ...state, customers: action.payload };
    default:
      return state;
  }
}

export function CustomerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loadCustomers = () => {
      if (!hasStoredSession()) {
        dispatch({ type: 'LOAD', payload: [] });
        return;
      }
      customerApi.getAll().then((data) => {
        dispatch({ type: 'LOAD', payload: data || [] });
      }).catch((error) => dispatch({ type: 'ERROR', payload: error.message || 'Could not load cloud data.' }));
    };
    loadCustomers();
    window.addEventListener(getSessionReadyEventName(), loadCustomers);
    return () => window.removeEventListener(getSessionReadyEventName(), loadCustomers);
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

  const updateCustomer = useCallback(async (customerId, form) => {
    const phone = normalizePhone(form.phone);
    if (state.customers.some((customer) => customer.id !== customerId && customer.phone === phone)) {
      throw new Error('A customer with this phone number already exists');
    }

    const currentCustomer = state.customers.find((customer) => customer.id === customerId);
    if (!currentCustomer) throw new Error('Customer not found');

    const updatedCustomer = {
      ...currentCustomer,
      name: form.name.trim(),
      phone,
      address: form.address.trim(),
      email: (form.email || '').trim(),
      photo: form.photo || '',
    };
    await persist(state.customers.map((customer) => (
      customer.id === customerId ? updatedCustomer : customer
    )));
    return updatedCustomer;
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
    error: state.error,
    addCustomer,
    updateCustomer,
    findByPhone,
    searchCustomers,
    addTransaction,
    refresh: () => customerApi.getAll().then((d) => dispatch({ type: 'SET', payload: d })),
  }), [state, addCustomer, updateCustomer, findByPhone, searchCustomers, addTransaction]);

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomers() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomers requires CustomerProvider');
  return ctx;
}
