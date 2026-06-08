// Coordinates utility for resolving Pakistani city addresses to coordinates with minor offsets.

const CITIES = [
  { keywords: ['karachi'], lat: 24.8607, lng: 67.0011 },
  { keywords: ['lahore'], lat: 31.5204, lng: 74.3587 },
  { keywords: ['islamabad'], lat: 33.6844, lng: 73.0479 },
  { keywords: ['rawalpindi'], lat: 33.5971, lng: 73.0479 },
  { keywords: ['faisalabad'], lat: 31.4187, lng: 73.0790 },
  { keywords: ['multan'], lat: 30.1575, lng: 71.5249 },
  { keywords: ['peshawar'], lat: 34.0150, lng: 71.5249 },
  { keywords: ['quetta'], lat: 30.1798, lng: 66.9750 },
  { keywords: ['sialkot'], lat: 32.5055, lng: 74.3695 },
  { keywords: ['gujranwala'], lat: 32.1877, lng: 74.1942 },
  { keywords: ['hyderabad'], lat: 25.3960, lng: 68.3578 },
];

/**
 * Returns a coordinate object for the first matching city keyword in the address.
 * Falls back to a default coordinate (Karachi) with a slight random offset to avoid overlapping markers.
 */
export function getCustomerCoordinates(address = "") {
  const lower = address.toLowerCase();
  for (const city of CITIES) {
    if (city.keywords.some(k => lower.includes(k))) {
      return { lat: city.lat, lng: city.lng };
    }
  }
  // Default to Karachi with random small offset
  const offset = () => (Math.random() - 0.5) * 0.02; // ~±0.01deg (~1km)
  return { lat: 24.8607 + offset(), lng: 67.0011 + offset() };
}
