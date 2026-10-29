// Confere, SKU por SKU, quais produtos de uma exportação do sistema têm foto:
// - no servidor de fotos: um HEAD por produto (não baixa a imagem); 200 = tem foto,
//   403 ou 404 = não tem (o CloudFront responde 403 para arquivo que não existe);
// - na loja antiga (impaktofestas.com.br, VTEX), pelo catálogo público dela: a foto de lá
//   entra para quem não tem foto no servidor de fotos.
//
// Uso:
//   npm run photos:check -- "C:/Users/Brenner/Desktop/rel111.csv"
//   npm run photos:check -- rel111.csv --url "https://outro-servidor/fotos/{sku}.jpg"
//   npm run photos:check -- rel111.csv --site
//
// Lê o CSV como o sistema exporta (separado por ";", em Windows-1252 ou UTF-8) e
// grava ao lado dele <nome>-fotos.csv com as mesmas colunas mais FOTO (SIM, NÃO ou
// ERRO, no servidor de fotos), FOTO LOJA ANTIGA (SIM ou NÃO) e URL IMAGEM (a do
// servidor de fotos, ou a da loja antiga quando só ela tem), pronto para abrir no
// Excel e para a coluna "URL IMAGEM" da planilha de produtos do site.
//
// Com --site, também regrava app/departamentos/system-products.ts com os produtos que
// têm foto, no departamento do site que corresponde à FAMÍLIA (DEPARTMENT_BY_FAMILY), e
// copia as fotos que só a loja antiga tem para public/fotos/produtos (em WebP), para o
// site não depender dela: as já copiadas continuam no site mesmo com a loja antiga fora
// do ar. Depois é só commitar e publicar.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { normalize } from "../app/lib/search.ts";

const DEFAULT_PHOTO_URL = "https://dfm0yhok7o14r.cloudfront.net/produtos/800/pr{sku}.webp";
const OLD_STORE_SEARCH = "https://www.impaktofestas.com.br/api/catalog_system/pub/products/search";
const CONCURRENCY = 16;
const ATTEMPTS = 3;
const SITE_PRODUCTS_FILE = new URL("../app/departamentos/system-products.ts", import.meta.url);
const SITE_PHOTOS_DIR = new URL("../public/fotos/produtos/", import.meta.url);

// Departamento do site para cada família do sistema, pelo código no começo da coluna
// FAMÍLIA ("057 BALÃO METALIZADO" → "057"). Família fora da lista não entra no site.
const DEPARTMENT_BY_FAMILY: Record<string, string> = {
  "049": "Balões", "057": "Balões",
  // Acessórios de festa (óculos, tiaras, bastões), temas, fantasias, sazonal (Halloween, Copa, festa junina)…
  "001": "Festas temáticas", "040": "Festas temáticas", "042": "Festas temáticas", "050": "Festas temáticas",
  "055": "Festas temáticas", "065": "Festas temáticas", "072": "Festas temáticas", "075": "Festas temáticas",
  // Alimentícios, velas de aniversário e formas de alumínio.
  "003": "Confeitaria", "044": "Confeitaria", "045": "Confeitaria", "052": "Confeitaria", "060": "Confeitaria",
  // Tudo de mesa e cozinha: descartáveis, embalagens, copos, isopor, vidro, potes, utilidade doméstica.
  "004": "Descartáveis", "005": "Descartáveis", "006": "Descartáveis", "008": "Descartáveis", "014": "Descartáveis",
  "016": "Descartáveis", "019": "Descartáveis", "022": "Descartáveis", "023": "Descartáveis", "025": "Descartáveis",
  "029": "Descartáveis", "032": "Descartáveis", "033": "Descartáveis", "064": "Descartáveis",
  "038": "Decoração", "047": "Decoração", "059": "Decoração", "067": "Decoração",
  // "Outros" são sobretudo argila, giz e tatuagem.
  "018": "Papelaria", "031": "Papelaria", "048": "Papelaria", "051": "Papelaria", "056": "Papelaria", "074": "Papelaria",
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { url: { type: "string", default: DEFAULT_PHOTO_URL }, site: { type: "boolean", default: false } },
});
const inputPath = positionals[0];
const urlTemplate = values.url;
if (!inputPath) throw new Error('Informe o CSV: npm run photos:check -- "C:/caminho/rel111.csv"');
if (!urlTemplate.includes("{sku}")) throw new Error("A URL precisa ter {sku} no lugar do código do produto.");

function decode(bytes: Buffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^\uFEFF/, "");
  } catch {
    // O relatório do sistema sai em Windows-1252 (acentos que não são UTF-8 válido).
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === delimiter) { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

// O servidor de fotos guarda os códigos com 6 dígitos: o 12193 é pr012193.webp.
function photoUrl(sku: string): string {
  return urlTemplate.replaceAll("{sku}", encodeURIComponent(/^\d+$/.test(sku) ? sku.padStart(6, "0") : sku));
}

// A loja antiga entrega a foto no tamanho pedido no endereço, quadrada e com fundo branco (sem cortar).
function oldStoreImage(url: string, size: number): string {
  return url.replace(/\/ids\/(\d+)(?:-\d+-\d+)?\//, `/ids/$1-${size}-${size}/`);
}

function toCsvField(value: string): string {
  return /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

type Result = "SIM" | "NÃO" | "ERRO";

async function hasPhoto(url: string): Promise<Result> {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15000) });
      if (response.ok) return "SIM";
      if (response.status === 403 || response.status === 404) return "NÃO";
    } catch {
      // Falha de rede ou tempo esgotado: tenta de novo.
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  return "ERRO";
}

/** Baixa a foto e grava em WebP, com o fundo branco das outras fotos de lá (algumas são PNG transparente). */
async function copyPhoto(url: string, file: URL): Promise<boolean> {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (response.ok) {
        const image = Buffer.from(await response.arrayBuffer());
        await sharp(image).flatten({ background: "#ffffff" }).webp({ quality: 80 }).toFile(fileURLToPath(file));
        return true;
      }
    } catch {
      // Falha de rede ou imagem inválida: tenta de novo.
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  return false;
}

type VtexProduct = { productReference?: string; items?: Array<{ images?: Array<{ imageUrl: string }> }> };

/**
 * Primeira foto de cada produto da loja antiga, por código do sistema: a referência de lá é o nosso
 * código com um 0 no fim (2295920 → 229592). Só a foto: a "marca" de lá é o fornecedor, a descrição
 * são anotações internas ("ALPHA/MO/VL.M") e as outras fotos são a mesma reenviada.
 */
async function fetchOldStorePhotos(): Promise<Map<string, string>> {
  const byCode = new Map<string, string>();
  for (let from = 0; ; from += 50) {
    // A busca da VTEX não passa do resultado 2.500; o catálogo tinha 2.090 produtos em 29/10/2026.
    if (from >= 2500) { console.warn("A loja antiga tem mais de 2.500 produtos: só os 2.500 primeiros foram lidos."); break; }
    const response = await fetch(`${OLD_STORE_SEARCH}?_from=${from}&_to=${from + 49}`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`a loja antiga respondeu ${response.status}`);
    const page = (await response.json()) as VtexProduct[];
    for (const product of page) {
      const code = product.productReference?.match(/^(\d{6})0$/)?.[1];
      const photo = product.items?.[0]?.images?.[0]?.imageUrl;
      if (code && photo && !byCode.has(code)) byCode.set(code, photo);
    }
    if (page.length < 50) break;
  }
  return byCode;
}

const text = decode(await readFile(inputPath));
const firstLine = text.slice(0, text.search(/\r?\n/));
const delimiter = firstLine.split(";").length >= firstLine.split(",").length ? ";" : ",";
const [header, ...rows] = parseCsv(text, delimiter);
// O relatório termina cada linha com ";", o que cria uma coluna vazia no fim.
while (header.length && header.at(-1) === "") header.pop();

const skuColumn = header.findIndex((name) => ["codigo", "sku"].includes(normalize(name)));
if (skuColumn === -1) throw new Error(`Não achei a coluna CÓDIGO ou SKU. Colunas: ${header.join(", ")}`);
const skuOf = (row: string[]) => row[skuColumn]?.trim() ?? "";

console.log(`${rows.length} produtos em ${inputPath}.`);
console.log("Lendo o catálogo da loja antiga…");
let oldStore = new Map<string, string>();
let oldStoreError = "";
try {
  oldStore = await fetchOldStorePhotos();
  console.log(`  ${oldStore.size} produtos da loja antiga com foto e código do sistema.`);
} catch (error) {
  oldStoreError = String(error);
  console.warn(`  Não consegui ler a loja antiga (${oldStoreError}); sigo só com o servidor de fotos.`);
}

console.log(`Testando ${urlTemplate}`);
const results: Result[] = new Array(rows.length);
let next = 0;
let done = 0;
const started = Date.now();

async function worker() {
  while (next < rows.length) {
    const index = next++;
    const sku = skuOf(rows[index]);
    results[index] = sku ? await hasPhoto(photoUrl(sku)) : "ERRO";
    if (++done % 1000 === 0 || done === rows.length) {
      const found = results.filter((result) => result === "SIM").length;
      console.log(`  ${done}/${rows.length} conferidos, ${found} com foto (${Math.round((Date.now() - started) / 1000)} s)`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

/** Foto do produto (card e página): a do servidor de fotos; sem ela, a primeira da loja antiga. */
function mainPhoto(index: number): string {
  const sku = skuOf(rows[index]);
  if (results[index] === "SIM") return photoUrl(sku);
  const oldStorePhoto = oldStore.get(sku);
  return oldStorePhoto ? oldStoreImage(oldStorePhoto, 500) : "";
}

const lines = [[...header, "FOTO", "FOTO LOJA ANTIGA", "URL IMAGEM"], ...rows.map((row, index) => {
  return [...header.map((_, column) => row[column] ?? ""), results[index], oldStore.has(skuOf(row)) ? "SIM" : "NÃO", mainPhoto(index)];
})];
const outputPath = inputPath.replace(/(\.csv)?$/i, "-fotos.csv");
// BOM + ";" para o Excel em português abrir com acentos e colunas certas.
await writeFile(outputPath, "\uFEFF" + lines.map((line) => line.map(toCsvField).join(";")).join("\r\n") + "\r\n", "utf8");

const count = (result: Result) => results.filter((value) => value === result).length;
const onlyOldStore = rows.filter((row, index) => results[index] !== "SIM" && oldStore.has(skuOf(row))).length;
console.log(`\nCom foto no servidor de fotos: ${count("SIM")}. Só na loja antiga: ${onlyOldStore}. Erro (testar de novo): ${count("ERRO")}.`);
console.log(`Sem foto em nenhum dos dois: ${rows.length - count("SIM") - onlyOldStore - count("ERRO")}.`);
console.log(`Resultado em ${outputPath}`);

if (values.site) {
  const familyColumn = header.findIndex((name) => normalize(name) === "familia");
  if (familyColumn === -1) throw new Error("--site precisa da coluna FAMÍLIA para escolher o departamento.");
  if (count("ERRO")) throw new Error(`${count("ERRO")} produtos deram erro no teste: rode de novo antes de atualizar o site, senão eles sairiam dele.`);
  // Uma foto da loja antiga já copiada não é baixada de novo, e continua valendo quando a loja
  // antiga não responde (ou depois que for desligada).
  if (oldStoreError) console.warn("A loja antiga não respondeu: só as fotos de lá já copiadas para public/fotos/produtos entram no site.");
  await mkdir(SITE_PHOTOS_DIR, { recursive: true });
  const copied = new Set(await readdir(SITE_PHOTOS_DIR));
  const used = new Set<string>();
  const pending: Array<{ url: string; file: string }> = [];
  const nameColumn = header.findIndex((column) => normalize(column) === "nome");
  const unmapped = new Map<string, number>();
  const siteRows = rows.flatMap((row, index) => {
    const sku = skuOf(row);
    const file = `${sku}.webp`;
    const onPhotoServer = results[index] === "SIM";
    if (!onPhotoServer && !oldStore.has(sku) && !copied.has(file)) return [];
    const family = row[familyColumn]?.trim() ?? "";
    const department = DEPARTMENT_BY_FAMILY[family.match(/^\d+/)?.[0] ?? ""];
    if (!department) {
      unmapped.set(family, (unmapped.get(family) ?? 0) + 1);
      return [];
    }
    // Como os nomes já publicados: sem o ponto final nem o "Ean :789…" que alguns cadastros têm no fim.
    const name = (row[nameColumn] ?? "").replace(/\s*Ean\s*:\s*\d+\s*$/i, "").replace(/[.\s]+$/, "");
    if (!name) return [];
    if (!onPhotoServer) {
      used.add(file);
      if (!copied.has(file)) pending.push({ url: mainPhoto(index), file });
    }
    return [{ departamento: department, codigo: sku, nome: name, imagem: onPhotoServer ? photoUrl(sku) : `/fotos/produtos/${file}` }];
  });
  siteRows.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { numeric: true }));

  console.log(`\nCopiando ${pending.length} fotos da loja antiga para public/fotos/produtos (${used.size - pending.length} já estavam lá)…`);
  const failed: string[] = [];
  let nextCopy = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (nextCopy < pending.length) {
      const { url, file } = pending[nextCopy++];
      if (!(await copyPhoto(url, new URL(file, SITE_PHOTOS_DIR)))) failed.push(url);
    }
  }));
  if (failed.length) throw new Error(`Não consegui copiar ${failed.length} fotos da loja antiga (${failed[0]}…): rode de novo antes de atualizar o site.`);

  await writeFile(SITE_PRODUCTS_FILE, [
    `// Gerado por \`npm run photos:check -- ${basename(inputPath)} --site\` em ${new Date().toLocaleDateString("pt-BR")}: os produtos`,
    "// da exportação do sistema que têm foto (no servidor de fotos, ou na loja antiga, copiada para",
    "// public/fotos/produtos), já com o departamento do site. Não edite à mão: rode o script de novo com a",
    "// exportação nova. Um código que também está na planilha (PRODUCTS_CSV_URL) aparece uma vez só, como",
    "// está na planilha.",
    "export const systemProductRows: Record<string, string>[] = [",
    ...siteRows.map((row) => `  ${JSON.stringify(row)},`),
    "];",
    "",
  ].join("\n"), "utf8");

  // Fotos de produtos que saíram do site, ou que ganharam foto no servidor de fotos.
  const unused = [...copied].filter((file) => !used.has(file));
  for (const file of unused) await rm(new URL(file, SITE_PHOTOS_DIR));
  if (unused.length) console.log(`Apaguei ${unused.length} fotos de public/fotos/produtos que o site não usa mais.`);

  const byDepartment = new Map<string, number>();
  for (const row of siteRows) byDepartment.set(row.departamento, (byDepartment.get(row.departamento) ?? 0) + 1);
  console.log(`\nSite: ${siteRows.length} produtos em ${fileURLToPath(SITE_PRODUCTS_FILE)}`);
  for (const [department, total] of byDepartment) console.log(`  ${department}: ${total}`);
  for (const [family, total] of unmapped) console.log(`  Fora do site (família sem departamento): ${family || "(vazia)"}, ${total}`);
}
