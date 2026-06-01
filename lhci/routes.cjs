/**
 * Route catalog for Realworld Angular Lighthouse CI.
 *
 * persona:
 * - guest    — unauthenticated (public pages + auth forms)
 * - customer — CUSTOMER role (client@pizza.dev by default)
 * - admin    — PIZZERIA_ADMIN role (admin@pizza.dev by default)
 *
 * Placeholders {pizzeriaId} and {orderId} are resolved at collect time.
 */
const ROUTES = [
  // Public / guest
  { path: '/pizzerias', persona: 'guest' },
  { path: '/pizzerias/{pizzeriaId}', persona: 'guest' },
  { path: '/cart', persona: 'guest' },
  { path: '/terms-and-conditions', persona: 'guest' },
  { path: '/unauthorized', persona: 'guest' },
  { path: '/lhci-not-found', persona: 'guest' },
  { path: '/auth/login', persona: 'guest' },
  { path: '/auth/register', persona: 'guest' },
  { path: '/auth/register-pizzeria', persona: 'guest' },

  // Customer (authenticated)
  { path: '/profile', persona: 'customer' },
  { path: '/orders', persona: 'customer' },
  { path: '/orders/{orderId}', persona: 'customer' },
  { path: '/checkout/delivery', persona: 'customer', setup: 'cart' },
  { path: '/checkout/schedule', persona: 'customer', setup: 'cart' },
  { path: '/checkout/review', persona: 'customer', setup: 'cart' },

  // Admin (PIZZERIA_ADMIN)
  { path: '/pizzerias/admin/pizzas', persona: 'admin' },
  { path: '/pizzerias/admin/configuration', persona: 'admin' },
  { path: '/orders/admin', persona: 'admin' },
];

function pathToRegex(path) {
  const pattern = path
    .replace(/\{pizzeriaId\}/g, '[^/]+')
    .replace(/\{orderId\}/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
}

/** Longest paths first so /orders/admin wins over /orders/{orderId}. */
const ROUTES_BY_SPECIFICITY = [...ROUTES].sort((a, b) => b.path.length - a.path.length);

function getRouteForPath(pathname) {
  return ROUTES_BY_SPECIFICITY.find((route) => pathToRegex(route.path).test(pathname));
}

function getPersonaForPath(pathname) {
  return getRouteForPath(pathname)?.persona ?? 'guest';
}

function getSetupForPath(pathname) {
  return getRouteForPath(pathname)?.setup;
}

module.exports = {
  ROUTES,
  getRouteForPath,
  getPersonaForPath,
  getSetupForPath,
};
