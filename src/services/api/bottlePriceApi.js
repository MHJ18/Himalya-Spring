import { getCloudBottlePrices, saveCloudBottlePrices } from '../cloud/himalayaDb';

export async function getBottlePrices(fallback) {
  const cloudPrices = await getCloudBottlePrices();
  let legacyPrices = null;
  try { legacyPrices = JSON.parse(localStorage.getItem('ws_daily_sale_price_defaults') || 'null'); } catch { legacyPrices = null; }
  if (legacyPrices) {
    const merged = { ...fallback, ...(cloudPrices || {}), ...legacyPrices };
    await saveCloudBottlePrices(merged);
    localStorage.removeItem('ws_daily_sale_price_defaults');
    return merged;
  }
  return { ...fallback, ...(cloudPrices || {}) };
}

export async function saveBottlePrices(prices) {
  await saveCloudBottlePrices(prices);
  return prices;
}
