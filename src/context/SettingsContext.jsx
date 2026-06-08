import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../data/constants';
import { settingsApi } from '../services/api/settingsApi';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  useEffect(() => {
    settingsApi.get().then((data) => setSettings(data));
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    document.body.classList.toggle('dashboard-dark', settings.darkMode);
    document.body.classList.toggle('dashboard-light', !settings.darkMode);
  }, [settings]);

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, darkMode: !prev.darkMode };
      settingsApi.save(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      settingsApi.save(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ settings, toggleDarkMode, updateSettings }),
    [settings, toggleDarkMode, updateSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings requires SettingsProvider');
  return ctx;
}
