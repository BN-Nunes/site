import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { searchCatalog } from "../app/lib/search.ts";
import { buildQuoteMessage } from "../app/lib/quote-message.ts";
import { clampQuantity } from "../app/lib/cart-quantity.ts";
import { serializeJsonLd } from "../app/lib/json-ld.ts";
import { haversineDistanceKm, sortByDistance, formatDistanceKm } from "../app/lib/geolocation.ts";
import { parseCsv } from "../app/lib/csv.ts";
import { mapCsvRowsToDepartments } from "../app/lib/product-catalog.ts";
import { departments } from "../app/departamentos/departments.ts";
import { getStore, storeSlug, stores } from "../app/lojas/stores.ts";
import { formatPhoneNumber, storeMapEmbedUrl, storeMapsUrl, storePhoneLink, storeWhatsappLink } from "../app/lib/store-contact.ts";
import { buildQuoteEvent } from "../app/lib/quote-events.ts";

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
  assert.match(html, /<h1>A festa começa na <span class="brand-word"><span class="sr-only">Impakto<\/span>/);
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
    "/lojas/perdizes",
    "/busca",
    "/busca?q=copos",
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

test("an unknown store returns 404", async () => {
  const { status } = await render("/lojas/loja-que-nao-existe");
  assert.equal(status, 404);
});

test("every page shares the same header (search, cart, nav) and footer", async () => {
  for (const route of ["/", "/lojas", "/carrinho", "/departamentos/baloes", "/quem-somos"]) {
    const { html } = await render(route);
    assert.match(html, /<form class="search" role="search" action="\/busca"/, `${route} should have the search form`);
    assert.match(html, /href="\/carrinho"/, `${route} should link to the cart`);
    assert.match(html, /href="\/departamentos\/papelaria"/, `${route} should list every department in the nav`);
    assert.match(html, /href="\/politica-de-privacidade"/, `${route} should have the shared footer`);
  }
});

test("the search page lists matching products from the catalog", async () => {
  const { status, html } = await render("/busca?q=copos");
  assert.equal(status, 200);
  assert.match(html, /Kit Descartáveis Coloridos/);
  assert.match(html, /noindex/);
});

test('searching for "copos" finds the disposables department and its products', () => {
  const result = searchCatalog("copos", departments);
  assert.equal(result.departments[0].slug, "descartaveis");
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every(({ department }) => department.slug === "descartaveis"));
  assert.equal(result.wantsStores, false);
});

test('searching for "balão" (singular, accented) still finds balloons', () => {
  const result = searchCatalog("balão", departments);
  assert.equal(result.departments[0].slug, "baloes");
  assert.equal(result.products[0].department.slug, "baloes");
});

test("a store-related search flags the stores shortcut", () => {
  assert.equal(searchCatalog("endereço da loja", departments).wantsStores, true);
});

test("empty or stop-word-only searches return nothing", () => {
  for (const query of ["   ", "de para com"]) {
    assert.deepEqual(searchCatalog(query, departments), { wantsStores: false, departments: [], products: [] });
  }
});

test("JSON-LD serialization cannot close the script tag", () => {
  const serialized = serializeJsonLd({ name: '</script><script>alert(1)</script> & co' });
  assert.doesNotMatch(serialized, /<|>|&/);
  assert.equal(JSON.parse(serialized).name, '</script><script>alert(1)</script> & co');
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
  assert.match(message, /produtos:\n\n1\. 2x/, "a blank line separates the greeting from the list");
  assert.doesNotMatch(message, /Observações/);
});

test("WhatsApp quote message appends trimmed notes when provided", () => {
  const message = buildQuoteMessage("Maria", [{ name: "Produto", quantity: 1 }], "  Festa dia 12, tema azul  ");
  assert.match(message, /\n\nObservações: Festa dia 12, tema azul$/);
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
  assert.equal(clampQuantity(Number.NaN), 1);
});

test("cookie consent controls functional persistence", async (t) => {
  const store = new Map();
  // Browser stubs must not outlive this test: the server bundle treats a global `window` as "running in the browser".
  const stubbed = ["window", "localStorage", "dispatchEvent", "CustomEvent"];
  const originals = new Map(stubbed.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
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

  const guarulhos3 = guarulhosStores.find((store) => store.name === "Guarulhos 3");
  const sorted = sortByDistance(guarulhosStores, { lat: guarulhos3.lat, lng: guarulhos3.lng });

  // The globally nearest store to this origin may be outside Guarulhos, but within
  // the filtered subset the nearest must still be Guarulhos 3 itself (distance ~0).
  assert.equal(sorted[0].name, "Guarulhos 3");
  assert.ok(sorted[0].distanceKm < 0.001);
});

test("every department icon is a fixed local image, except ofertas' literal percent sign", async () => {
  for (const department of departments) {
    if (department.slug === "ofertas") {
      assert.equal(department.icon, "%");
      continue;
    }
    assert.match(department.icon, /^\/departments\/[\w-]+\.webp$/);
    await access(new URL(`../public${department.icon}`, import.meta.url));
  }
});

test("all 11 stores have plausible São Paulo-area coordinates", () => {
  assert.equal(stores.length, 11);
  for (const store of stores) {
    assert.ok(store.lat < -22 && store.lat > -25, `${store.name} latitude out of range: ${store.lat}`);
    assert.ok(store.lng < -45 && store.lng > -48, `${store.name} longitude out of range: ${store.lng}`);
  }
});

test("every store photo points to a file in public/fotos/lojas", async () => {
  for (const store of stores.filter((store) => store.photo)) {
    assert.match(store.photo, /^\/fotos\/lojas\/[\w-]+\.webp$/);
    await access(new URL(`../public${store.photo}`, import.meta.url));
  }
});

test("every page links to the official Mercado Livre store, and the homepage has a section for it", async () => {
  const link = /<a href="https:\/\/www\.mercadolivre\.com\.br\/loja\/impakto-festas" target="_blank" rel="noreferrer">/;
  for (const path of ["/", "/lojas", "/carrinho"]) {
    const { html } = await render(path);
    assert.match(html, link, `${path} should link to the Mercado Livre store`);
  }
  const { html } = await render("/");
  assert.match(html, /<h2 id="marketplace-title">/);
  assert.match(html, /<img class="ml-symbol" src="\/marcas\/mercado-livre\.png"/);
  await access(new URL("../public/marcas/mercado-livre.png", import.meta.url));
});

test("every photo on the homepage exists in public/fotos", async () => {
  const { html } = await render("/");
  const photos = [...new Set([...html.matchAll(/src="(\/fotos\/[^"]+)"/g)].map((match) => match[1]))];
  assert.ok(photos.length > 0);
  for (const photo of photos) await access(new URL(`../public${photo}`, import.meta.url));
});

test("store WhatsApp numbers are valid São Paulo mobiles and never shared between stores", () => {
  const numbers = stores.filter((store) => store.whatsapp).map((store) => store.whatsapp);
  const withoutWhatsapp = stores.filter((store) => !store.whatsapp).map((store) => store.name);
  assert.deepEqual(withoutWhatsapp, ["Osasco"], "only Osasco (not on impaktofestas.com.br) should fall back to the central number");
  for (const number of numbers) assert.match(number, /^55119\d{8}$/);
  assert.equal(new Set(numbers).size, numbers.length);
});

test("pages show the real store count instead of a hard-coded one", async () => {
  for (const path of ["/", "/busca?q=balao", "/lojas/perdizes"]) {
    const { html } = await render(path);
    const counts = [...html.matchAll(/(\d+)(?:<!-- -->)? (?:lojas|filiais)\b/g)].map((match) => Number(match[1]));
    assert.ok(counts.length > 0, `${path} should mention the number of stores`);
    for (const count of counts) assert.equal(count, stores.length, `${path} mentions ${count} stores`);
  }
});

test("store page addresses are readable, unique and lead back to the store", () => {
  assert.equal(storeSlug(stores.find((store) => store.name === "Santo André")), "santo-andre");
  assert.equal(storeSlug(stores.find((store) => store.name === "Guarulhos 3")), "guarulhos-3");
  const slugs = stores.map(storeSlug);
  assert.equal(new Set(slugs).size, stores.length);
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(storeSlug(getStore(slug)), slug);
  }
  assert.equal(getStore("loja-que-nao-existe"), undefined);
});

test("every store has a page with its address, contacts, map link and structured data", async () => {
  for (const store of stores) {
    const slug = storeSlug(store);
    const { status, html } = await render(`/lojas/${slug}`);
    assert.equal(status, 200, `/lojas/${slug}`);
    assert.ok(html.includes(`<title>Loja ${store.name} | Impakto Festas</title>`), `${store.name}: title`);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+/lojas/${slug}"`));
    assert.ok(html.includes(`Impakto <strong>${store.name}</strong>`), `${store.name}: H1`);
    assert.ok(html.includes(`CEP ${store.cep}`), `${store.name}: address`);
    assert.ok(html.includes(storeMapsUrl(store).replaceAll("&", "&amp;")), `${store.name}: Google Maps link`);
    assert.ok(html.includes(storeWhatsappLink(store).url.replaceAll("&", "&amp;")), `${store.name}: WhatsApp link`);
    // The map iframe only loads when the visitor asks for it.
    assert.doesNotMatch(html, /<iframe/);

    const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    const storeData = jsonLd.find((data) => data["@type"] === "Store");
    assert.ok(storeData, `${store.name}: Store JSON-LD`);
    assert.deepEqual(storeData.geo, { "@type": "GeoCoordinates", latitude: store.lat, longitude: store.lng });
    assert.match(storeData.url, new RegExp(`/lojas/${slug}$`));
    assert.ok(jsonLd.some((data) => data["@type"] === "BreadcrumbList"), `${store.name}: breadcrumb`);

    // Three other stores are suggested, each linking to its own page.
    const nearby = [...html.matchAll(/<a href="\/lojas\/([a-z0-9-]+)" class="store-nearby-card"/g)].map((match) => match[1]);
    assert.equal(nearby.length, 3, `${store.name}: nearby stores`);
    assert.ok(!nearby.includes(slug), `${store.name} should not suggest itself`);
  }
});

test("the store list links each card to its store page, and the sitemap lists every store page", async () => {
  const html = (await render("/lojas")).html.replaceAll("<!-- -->", "");
  const { html: sitemap } = await render("/sitemap.xml");
  for (const store of stores) {
    assert.ok(html.includes(`<h2><a href="/lojas/${storeSlug(store)}">Impakto ${store.name}</a></h2>`), `/lojas: ${store.name}`);
    assert.match(sitemap, new RegExp(`<loc>[^<]+/lojas/${storeSlug(store)}</loc>`), `sitemap: ${store.name}`);
  }
});

test("the store map embeds and links to the same Google Maps search", () => {
  const perdizes = getStore("perdizes");
  const query = encodeURIComponent("Impakto Festas Rua Cardoso de Almeida, 859 — São Paulo/SP, CEP 05013-001");
  assert.equal(storeMapsUrl(perdizes), `https://www.google.com/maps/search/?api=1&query=${query}`);
  assert.equal(storeMapEmbedUrl(perdizes), `https://www.google.com/maps?q=${query}&output=embed`);
});

test("the quote statistics record the store and items, but nothing that identifies the customer", () => {
  const cart = [
    { id: "bal-buque-colorido", sku: "BAL-001", name: "Buquê de Balões Coloridos", description: "…", department: "Balões", image: "/products/baloes-buque.jpg", price: "Preço sob consulta", quantity: 3 },
  ];
  assert.deepEqual(buildQuoteEvent(getStore("perdizes"), cart, false), {
    store_cnpj: "11.588.752/0012-94",
    store_name: "Perdizes",
    signed_in: false,
    items: [{ id: "bal-buque-colorido", sku: "BAL-001", name: "Buquê de Balões Coloridos", department: "Balões", quantity: 3 }],
  });
});

test("the visit statistics script is only included on Vercel deployments", async (t) => {
  const original = process.env.VERCEL;
  t.after(() => { if (original === undefined) delete process.env.VERCEL; else process.env.VERCEL = original; });

  delete process.env.VERCEL;
  assert.doesNotMatch((await render("/")).html, /_vercel\/insights/);
  process.env.VERCEL = "1";
  assert.match((await render("/")).html, /<script defer="" src="\/_vercel\/insights\/script\.js"><\/script>/);
});

test("store WhatsApp link names the store and falls back to the central number", () => {
  const barueri = storeWhatsappLink(stores.find((store) => store.name === "Barueri"));
  assert.equal(barueri.direct, true);
  assert.equal(barueri.display, "(11) 97354-0454");
  assert.match(barueri.url, /^https:\/\/api\.whatsapp\.com\/send\?phone=5511973540454&text=/);
  assert.match(decodeURIComponent(barueri.url), /loja Impakto Barueri\.$/);

  const withoutNumber = storeWhatsappLink({ ...stores[0], name: "Teste", whatsapp: undefined });
  assert.equal(withoutNumber.direct, false);
  assert.match(withoutNumber.url, /phone=5511940591588&/);
  assert.equal(formatPhoneNumber("5511940591588"), "(11) 94059-1588");
});

test("store landline phones become tel: links, and stores without one get no call button", () => {
  assert.deepEqual(storePhoneLink(stores.find((store) => store.name === "Barueri")), { href: "tel:+551146155083", display: "(11) 4615-5083" });
  // Cotia's landline is commented out on the official page, so it must not be published here.
  assert.equal(storePhoneLink(stores.find((store) => store.name === "Cotia")), null);
  for (const store of stores.filter((candidate) => candidate.phone)) assert.match(store.phone, /^5511[2-5]\d{7}$/);
});

test("parseCsv handles quoted fields with commas, escaped quotes and a header-only file", () => {
  const csv = 'departamento,nome,descricao\nBalões,"Kit A","Tem vírgula, aspas ""duplas"" e tudo"\n';
  assert.deepEqual(parseCsv(csv), [{ departamento: "Balões", nome: "Kit A", descricao: 'Tem vírgula, aspas "duplas" e tudo' }]);
  assert.deepEqual(parseCsv("departamento,nome\n"), []);
  assert.deepEqual(parseCsv(""), []);
});

test("mapCsvRowsToDepartments matches department names loosely, skips bad rows, allows a missing price, and falls back per department", () => {
  const rows = [
    { departamento: "balões", nome: "Buquê Extra", preco: "R$ 10", disponivel: "sim" }, // sem acento/maiúscula
    { departamento: "Departamento Inexistente", nome: "Fantasma", preco: "R$ 1", disponivel: "sim" }, // ignorado
    { departamento: "Confeitaria", nome: "", preco: "R$ 5", disponivel: "sim" }, // sem nome, ignorado
    { departamento: "Confeitaria", nome: "Sem preço", preco: "", disponivel: "sim" }, // sem preço, válido
  ];

  const merged = mapCsvRowsToDepartments(rows, departments);
  const baloes = merged.find((department) => department.slug === "baloes");
  const confeitaria = merged.find((department) => department.slug === "confeitaria");
  const descartaveis = merged.find((department) => department.slug === "descartaveis");

  assert.deepEqual(baloes.products, [{ id: "baloes-buque-extra", sku: undefined, name: "Buquê Extra", description: "", price: "R$ 10", image: "", available: true }]);
  // Preço vazio não invalida a linha: o card só não mostra o preço.
  assert.deepEqual(confeitaria.products, [{ id: "confeitaria-sem-preco", sku: undefined, name: "Sem preço", description: "", price: "", image: "", available: true }]);
  // Descartáveis não apareceu na planilha: mantém o catálogo estático como fallback.
  assert.deepEqual(descartaveis.products, departments.find((department) => department.slug === "descartaveis").products);
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
