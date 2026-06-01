const { BASE_URL, API_BASE_URL } = require('./constants.cjs');
const { ROUTES } = require('./routes.cjs');

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function resolveDynamicValues() {
  const pizzerias = await fetchJson(`${API_BASE_URL}/api/pizzerias?limit=50`);
  const pizzeria =
    pizzerias.items?.find((item) => (item._count?.pizzas ?? 0) > 0) ?? pizzerias.items?.[0];

  const pizzeriaId = pizzeria?.id;
  if (!pizzeriaId) {
    throw new Error('No pizzerias returned from API — cannot resolve /pizzerias/{pizzeriaId}');
  }

  const orderId = 'seed-order-delivered';

  return { pizzeriaId, orderId };
}

function expandRoutePath(path, values) {
  return path
    .replace('{pizzeriaId}', values.pizzeriaId)
    .replace('{orderId}', values.orderId);
}

async function buildUrls() {
  const values = await resolveDynamicValues();

  return ROUTES.map((route) => {
    const path = expandRoutePath(route.path, values);
    return `${BASE_URL}${path}`;
  });
}

module.exports = {
  buildUrls,
  resolveDynamicValues,
};
