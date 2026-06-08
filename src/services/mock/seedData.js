import { v4 as uuidv4 } from 'uuid';
import { BOTTLE_TYPES } from '../../data/constants';
import { getCustomerAvatar } from '../../utils/customerPhotos';

const NAMES = [
  'Ahmed Khan', 'Fatima Ali', 'Hassan Raza', 'Ayesha Malik', 'Usman Sheikh',
  'Zainab Hussain', 'Bilal Ahmed', 'Sana Iqbal', 'Omar Farooq', 'Hira Siddiqui',
  'Imran Qureshi', 'Nadia Butt', 'Kamran Javed', 'Rabia Tariq', 'Saad Mahmood',
];

const AREAS = [
  'Clifton, Karachi', 'DHA Phase 5, Lahore', 'F-7, Islamabad', 'Gulshan, Karachi',
  'Bahria Town, Rawalpindi', 'Model Town, Lahore', 'North Nazimabad, Karachi',
];

const PRICES = { 'Small Bottle': 40, 'Medium Bottle': 60, 'Large Bottle': 90, 'Gallon': 150 };

function randomPhone() {
  return `+92${String(3000000000 + Math.floor(Math.random() * 999999999)).slice(0, 10)}`;
}

function randomDate(daysAgoMax) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgoMax));
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
  return d.toISOString();
}

function createTransaction(daysAgoMax) {
  const bottleType = BOTTLE_TYPES[Math.floor(Math.random() * BOTTLE_TYPES.length)];
  const quantity = 1 + Math.floor(Math.random() * 8);
  const price = Math.max(20, PRICES[bottleType] + Math.floor(Math.random() * 10) - 5);
  return {
    id: uuidv4(),
    date: randomDate(daysAgoMax),
    bottleType,
    quantity,
    pricePerBottle: price,
    totalAmount: quantity * price,
    notes: Math.random() > 0.7 ? 'Regular delivery' : '',
  };
}

export function generateSeedData() {
  const now = new Date();
  return NAMES.map((name, i) => {
    const history = Array.from({ length: 3 + Math.floor(Math.random() * 12) }, () =>
      createTransaction(90)
    );
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      id: uuidv4(),
      name,
      phone: randomPhone(),
      address: AREAS[i % AREAS.length],
      email: `${name.split(' ')[0].toLowerCase()}@example.com`,
      photo: getCustomerAvatar(i),
      createdAt: new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 8), 1 + i).toISOString(),
      purchaseHistory: history,
    };
  });
}
