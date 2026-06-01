const BASE_URL = process.env.LHCI_BASE_URL ?? 'https://www.realworldangular.org';
const API_BASE_URL = process.env.LHCI_API_BASE_URL ?? 'https://api.realworldangular.org';

const USERS = {
  customer: {
    email: process.env.LHCI_CUSTOMER_EMAIL ?? 'client@pizza.dev',
    password: process.env.LHCI_CUSTOMER_PASSWORD ?? 'password123',
  },
  admin: {
    email: process.env.LHCI_ADMIN_EMAIL ?? 'admin@pizza.dev',
    password: process.env.LHCI_ADMIN_PASSWORD ?? 'password123',
  },
};

module.exports = {
  BASE_URL,
  API_BASE_URL,
  USERS,
};
