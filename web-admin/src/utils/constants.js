export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  PASSENGER: 'PASSENGER',
  DRIVER: 'DRIVER',
  SUB_ADMIN: 'SUB_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const ROLE_LABELS = {
  PASSENGER: 'Passenger',
  DRIVER: 'Driver',
  SUB_ADMIN: 'Sub Admin',
  SUPER_ADMIN: 'Super Admin',
};

export const TRANSACTION_TYPES = {
  TOP_UP: 'TOP_UP',
  FARE_PAYMENT: 'FARE_PAYMENT',
  DEPOSIT: 'DEPOSIT',
  REFUND: 'REFUND',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
};

export const ETHIOPIAN_BANKS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Awash Bank',
  'Dashen Bank',
  'Bank of Abyssinia',
  'Hibret Bank',
  'Wegagen Bank',
  'Nib International Bank',
  'Cooperative Bank of Oromia',
  'Zemen Bank',
  'Oromia International Bank',
  'Bunna International Bank',
  'Berhan International Bank',
  'Abay Bank',
  'Addis International Bank',
  'Debub Global Bank',
  'Enat Bank',
  'ZamZam Bank',
  'Hijra Bank',
  'Siinqee Bank',
  'Tsedey Bank',
  'Amhara Bank',
  'Gadaa Bank',
  'Shabelle Bank',
  'Ahadu Bank',
  'Tsehay Bank'
];

