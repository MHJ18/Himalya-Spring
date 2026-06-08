import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../../data/constants';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { getCloudSettings, saveCloudSettings } from '../cloud/himalayaDb';

export const settingsApi = {
  async get() {
    try {
      const cloudSettings = await getCloudSettings();
      if (cloudSettings) {
        saveToStorage(STORAGE_KEYS.SETTINGS, cloudSettings);
        return { ...DEFAULT_SETTINGS, ...cloudSettings };
      }
    } catch {
      // Keep local settings if cloud is unavailable.
    }
    return loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  async save(settings) {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    try {
      await saveCloudSettings(settings);
    } catch {
      // Local settings remain the source until cloud is ready.
    }
    return settings;
  },
};
