const { BASE_URL, API_BASE_URL, USERS } = require('./constants.cjs');
const { getPersonaForPath, getSetupForPath } = require('./routes.cjs');

async function callAuthApi(page, path, body) {
  await page.evaluate(
    async ({ apiBaseUrl, path, body }) => {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        throw new Error(`${path} failed with ${response.status}`);
      }
    },
    { apiBaseUrl: API_BASE_URL, path, body },
  );
}

async function login(page, persona) {
  const user = USERS[persona];
  await callAuthApi(page, '/api/auth/login', {
    email: user.email,
    password: user.password,
  });
  await page.reload({ waitUntil: 'networkidle2' });
}

async function logout(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await callAuthApi(page, '/api/auth/logout');
  await page.reload({ waitUntil: 'networkidle2' });
}

async function clickRwButton(page, predicate) {
  await page.waitForFunction(
    (fnSource) => {
      const predicateFn = new Function('el', `return (${fnSource})(el)`);
      const buttons = [...document.querySelectorAll('rw-button')];
      return buttons.some((el) => predicateFn(el));
    },
    {},
    predicate.toString(),
  );

  await page.evaluate(
    (fnSource) => {
      const predicateFn = new Function('el', `return (${fnSource})(el)`);
      const button = [...document.querySelectorAll('rw-button')].find((el) => predicateFn(el));
      button?.click();
    },
    predicate.toString(),
  );
}

async function ensureCartWithItem(page, pizzeriaId) {
  await page.goto(`${BASE_URL}/pizzerias/${pizzeriaId}`, { waitUntil: 'networkidle2' });

  await clickRwButton(
    page,
    (el) => el.textContent?.includes('Add to cart') && Boolean(el.closest('.pizza-card')),
  );

  await page.waitForSelector('form.order-modal', { timeout: 15_000 });
  await clickRwButton(
    page,
    (el) => el.textContent?.includes('Add to cart') && Boolean(el.closest('.order-modal')),
  );
  await page.waitForSelector('.cart-added-banner', { timeout: 15_000 }).catch(() => undefined);
}

async function resolvePizzeriaId(page) {
  return page.evaluate(async (apiBaseUrl) => {
    const response = await fetch(`${apiBaseUrl}/api/pizzerias?limit=50`, {
      credentials: 'include',
    });
    const data = await response.json();
    const pizzeria =
      data.items?.find((item) => (item._count?.pizzas ?? 0) > 0) ?? data.items?.[0];
    return pizzeria?.id ?? null;
  }, API_BASE_URL);
}

/**
 * Runs before each URL's Lighthouse runs. LHCI passes a Browser, not a Page.
 *
 * @param {import('puppeteer').Browser} browser
 * @param {{ url: string }} context
 */
module.exports = async (browser, context) => {
  const pathname = new URL(context.url).pathname;
  const persona = getPersonaForPath(pathname);
  const setup = getSetupForPath(pathname);

  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    if (persona === 'guest') {
      await logout(page);
      return;
    }

    await login(page, persona);

    if (setup === 'cart') {
      const pizzeriaId = await resolvePizzeriaId(page);
      if (!pizzeriaId) {
        throw new Error('Could not resolve a pizzeria id for checkout cart setup');
      }
      await ensureCartWithItem(page, pizzeriaId);
    }
  } finally {
    await page.close();
  }
};
