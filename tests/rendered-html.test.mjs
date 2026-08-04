import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { resolveSearch } from "../app/lib/search.ts";
import { buildQuoteMessage } from "../app/lib/quote-message.ts";
import { clampQuantity } from "../app/lib/cart-quantity.ts";
import { haversineDistanceKm, sortByDistance, formatDistanceKm } from "../app/lib/geolocation.ts";
import { departments } from "../app/departamentos/departments.ts";
import { stores } from "../app/lojas/stores.ts";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  return { status: response.status, html: await response.text() };
}

test("homepage renders the correct title and H1", async () => {
  const { status, html } = await render("/");
  assert.equal(status, 200);
  assert.match(html, /<title>Impakto Festas \| Tudo para sua comemoração<\/title>/);
  assert.match(html, /<h1>Tudo para transformar qualquer momento em <strong>festa\.<\/strong><\/h1>/);
});

test("homepage links to the cookie policy", async () => {
  const { html } = await render("/");
  assert.match(html, /href="\/politica-de-cookies"/);
});

test("homepage links to the privacy policy", async () => {
  const { html } = await render("/");
  assert.match(html, /href="\/politica-de-privacidade"/);
});

test("main routes return 200", async () => {
  const routes = [
    "/",
    "/carrinho",
    "/conta",
    "/lojas",
    "/quem-somos",
    "/politica-de-cookies",
    "/politica-de-privacidade",
    "/departamentos/festas-tematicas",
  ];

  for (const route of routes) {
    const { status } = await render(route);
    assert.equal(status, 200, `expected ${route} to return 200`);
  }
});

test("an unknown department returns 404", async () => {
  const { status } = await render("/departamentos/departamento-que-nao-existe");
  assert.equal(status, 404);
});

test('search for "copos" points to the disposables department', () => {
  const result = resolveSearch("copos", departments);
  assert.deepEqual(result, { type: "department", slug: "descartaveis" });
});

test('search for "balões" points to the balloons department', () => {
  const result = resolveSearch("balões", departments);
  assert.deepEqual(result, { type: "department", slug: "baloes" });
});

test("search for a store-related term points to the stores page", () => {
  const result = resolveSearch("endereço da loja", departments);
  assert.deepEqual(result, { type: "stores" });
});

test("empty search returns the empty result", () => {
  assert.deepEqual(resolveSearch("   ", departments), { type: "empty" });
});

test("WhatsApp quote message includes name, quantity, product and SKU", () => {
  const message = buildQuoteMessage("Maria Silva", [
    { name: "Kit Festa Unicórnio", quantity: 2, sku: "BAL-001" },
    { name: "Copos descartáveis", quantity: 10 },
  ]);

  assert.match(message, /Maria Silva/);
  assert.match(message, /2x Kit Festa Unicórnio/);
  assert.match(message, /Código: BAL-001/);
  assert.match(message, /10x Copos descartáveis/);
});

test("WhatsApp quote message is empty without a customer name or items", () => {
  assert.equal(buildQuoteMessage("", [{ name: "Produto", quantity: 1 }]), "");
  assert.equal(buildQuoteMessage("Maria", []), "");
});

test("cart quantity is clamped between 1 and 99", () => {
  assert.equal(clampQuantity(0), 1);
  assert.equal(clampQuantity(-5), 1);
  assert.equal(clampQuantity(1), 1);
  assert.equal(clampQuantity(99), 99);
  assert.equal(clampQuantity(150), 99);
  assert.equal(clampQuantity(42.9), 42);
});

test("cookie consent controls functional persistence", async () => {
  const store = new Map();
  globalThis.window = globalThis;
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
  globalThis.dispatchEvent = () => true;
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  };

  const { getStoredConsent, isFunctionalAllowed, setConsent } = await import("../app/lib/cookie-consent.ts");

  assert.equal(getStoredConsent(), null);
  assert.equal(isFunctionalAllowed(), false);

  setConsent("necessary");
  assert.equal(getStoredConsent(), "necessary");
  assert.equal(isFunctionalAllowed(), false);

  setConsent("functional");
  assert.equal(getStoredConsent(), "functional");
  assert.equal(isFunctionalAllowed(), true);

  // Downgrading back to "necessary" must clear previously persisted functional data.
  store.set("impakto-theme", "dark");
  store.set("impakto-orcamento", "[]");
  setConsent("necessary");
  assert.equal(store.has("impakto-theme"), false);
  assert.equal(store.has("impakto-orcamento"), false);
});

test("haversineDistanceKm returns 0 for the same point and ~111km per degree of latitude", () => {
  assert.equal(haversineDistanceKm({ lat: -23.55, lng: -46.63 }, { lat: -23.55, lng: -46.63 }), 0);
  const distance = haversineDistanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
  assert.ok(Math.abs(distance - 111.19) < 1, `expected ~111.19km, got ${distance}`);
});

test("sortByDistance ranks the store closest to the given coordinates first", () => {
  const barueri = stores.find((store) => store.name === "Barueri");
  const sorted = sortByDistance(stores, { lat: barueri.lat, lng: barueri.lng });
  assert.equal(sorted[0].name, "Barueri");
  assert.ok(sorted[0].distanceKm < 0.001);
  assert.ok(sorted[0].distanceKm <= sorted[1].distanceKm);
});

test("formatDistanceKm shows meters below 1km and km with a comma above it", () => {
  assert.equal(formatDistanceKm(0.35), "350 m");
  assert.equal(formatDistanceKm(1.2), "1,2 km");
  assert.equal(formatDistanceKm(12.04), "12,0 km");
});

test("sortByDistance ranks the closest store first within a city-filtered subset too", () => {
  const guarulhosStores = stores.filter((store) => store.city === "Guarulhos");
  assert.ok(guarulhosStores.length > 1, "expected more than one Guarulhos store to filter among");

  const guarulhos2 = guarulhosStores.find((store) => store.name === "Guarulhos 2");
  const sorted = sortByDistance(guarulhosStores, { lat: guarulhos2.lat, lng: guarulhos2.lng });

  // The globally nearest store to this origin may be outside Guarulhos, but within
  // the filtered subset the nearest must still be Guarulhos 2 itself (distance ~0).
  assert.equal(sorted[0].name, "Guarulhos 2");
  assert.ok(sorted[0].distanceKm < 0.001);
});

test("all 13 stores have plausible São Paulo-area coordinates", () => {
  assert.equal(stores.length, 13);
  for (const store of stores) {
    assert.ok(store.lat < -22 && store.lat > -25, `${store.name} latitude out of range: ${store.lat}`);
    assert.ok(store.lng < -45 && store.lng > -48, `${store.name} longitude out of range: ${store.lng}`);
  }
});

test("no private key appears in the client bundle", async () => {
  const assetsDir = new URL("../dist/client/assets/", import.meta.url);
  const files = (await readdir(assetsDir)).filter((file) => file.endsWith(".js") || file.endsWith(".css"));
  assert.ok(files.length > 0, "expected client assets to exist after build");

  for (const file of files) {
    const content = await readFile(new URL(file, assetsDir), "utf8");
    assert.doesNotMatch(content.toLowerCase(), /mercadopago|mercado_pago_access_token|service_role/i, `${file} must not reference Mercado Pago or Supabase service role`);
    assert.doesNotMatch(content, /APP_USR-|TEST-\d{10,}/, `${file} must not contain a hardcoded Mercado Pago token`);
  }
});
