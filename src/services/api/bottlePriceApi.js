import { getCloudBottlePrices, saveCloudBottlePrices } from '../cloud/himalayaDb';

const PRICE_STORAGE_KEY = 'ws_daily_sale_price_defaults';

export async function getBottlePrices(fallback) {
  try {
    const cloudPrices = await getCloudBottlePrices();
    if (cloudPrices && Object.keys(cloudPrices).length) {
      localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify({ ...fallback, ...cloudPrices }));
      return { ...fallback, ...cloudPrices };
    }
  } catch {
    // Keep local prices if cloud is unavailable.
  }

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY) || '{}') };
  } catch {
    return fallback;
  }
}

export async function saveBottlePrices(prices) {
  localStorage.setItem(PRICE_STORAGE_KEY, JSON.stringify(prices));
  try {
    await saveCloudBottlePrices(prices);
  } catch {
    // Local prices remain available until cloud is ready.
  }
  return prices;
}
