import type { Department, Product } from "../departamentos/departments";

const departmentAliases: Record<string, string[]> = {
  baloes: ["balao", "baloes", "bexiga", "bexigas", "latex", "metalizado"],
  "festas-tematicas": ["tema", "temas", "festa infantil", "fantasia", "unicornio", "dinossauro", "aniversario"],
  confeitaria: ["bolo", "bolos", "doce", "doces", "cupcake", "cupcakes", "confeitar"],
  descartaveis: ["copo", "copos", "taca", "tacas", "canudo", "canudos", "prato", "pratos", "talher", "talheres", "guardanapo", "guardanapos"],
  decoracao: ["decorar", "decoracao", "painel", "cortina", "enfeite", "luminaria", "vaso", "arco"],
  papelaria: ["convite", "convites", "cartao", "cartoes", "sacola", "sacolas", "lembrancinha", "tag", "adesivo", "embalagem"],
  ofertas: ["oferta", "ofertas", "promocao", "promocoes", "desconto", "combo"],
};

/** Palavras que aparecem em quase toda descrição e só gerariam ruído na busca. */
const STOP_WORDS = new Set(["de", "da", "do", "das", "dos", "para", "pra", "com", "em", "no", "na", "nos", "nas", "um", "uma", "uns", "umas", "e", "o", "a", "os", "as", "por"]);

const STORE_QUERY = /\b(loja|lojas|filial|filiais|endereco|enderecos|unidade|unidades)\b/;

/** Tamanho máximo de uma busca, igual ao `maxLength` dos campos. */
export const MAX_QUERY_LENGTH = 80;

/** Lê uma busca da URL (`?q=`, `?busca=`): só o primeiro valor, sem espaços nas pontas e com tamanho limitado. */
export function readQueryParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

export function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR").trim();
}

/** Quebra a busca em termos úteis, sem stop words e sem o "s" final (copos → copo, convites → convite). */
export function searchTerms(normalizedQuery: string): string[] {
  return normalizedQuery
    .split(/\s+/)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term))
    .map((term) => (term.length > 3 && term.endsWith("s") ? term.slice(0, -1) : term));
}

function scoreFields(terms: string[], fields: Array<{ value: string; weight: number }>): number {
  const normalizedFields = fields.map((field) => ({ ...field, value: normalize(field.value) }));
  return terms.reduce(
    (score, term) => score + normalizedFields.reduce((termScore, field) => termScore + (field.value.includes(term) ? field.weight : 0), 0),
    0,
  );
}

export function departmentScore(department: Department, normalizedQuery: string): number {
  return scoreFields(searchTerms(normalizedQuery), [
    { value: department.name, weight: 12 },
    { value: departmentAliases[department.slug]?.join(" ") ?? "", weight: 11 },
    { value: department.productTypes.join(" "), weight: 9 },
    { value: department.products.map((product) => `${product.name} ${product.sku ?? ""}`).join(" "), weight: 8 },
    { value: department.products.map((product) => product.description).join(" "), weight: 4 },
    { value: `${department.shortDescription} ${department.description}`, weight: 2 },
  ]);
}

function productFields(product: Product): Array<{ value: string; weight: number }> {
  return [
    { value: `${product.name} ${product.sku ?? ""}`, weight: 10 },
    { value: product.description, weight: 4 },
  ];
}

function productScore(product: Product, department: Department, terms: string[]): number {
  return scoreFields(terms, [
    ...productFields(product),
    // Um produto de "Descartáveis" é relevante para "copos" mesmo que o nome não cite copos.
    { value: `${department.name} ${departmentAliases[department.slug]?.join(" ") ?? ""} ${department.productTypes.join(" ")}`, weight: 3 },
  ]);
}

export type CatalogSearchResult = {
  /** A busca menciona lojas/endereços: vale mostrar o atalho para /lojas. */
  wantsStores: boolean;
  departments: Department[];
  products: Array<{ product: Product; department: Department }>;
};

/** Busca pura no catálogo (sem efeitos colaterais), ordenada por relevância. */
export function searchCatalog(query: string, departments: Department[]): CatalogSearchResult {
  const normalizedQuery = normalize(query);
  const terms = searchTerms(normalizedQuery);
  if (terms.length === 0) return { wantsStores: false, departments: [], products: [] };

  const matchedDepartments = departments
    .map((department) => ({ department, score: departmentScore(department, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.department);

  const products = departments
    .flatMap((department) => department.products.map((product) => ({ product, department, score: productScore(product, department, terms) })))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.available) - Number(a.product.available))
    .map(({ product, department }) => ({ product, department }));

  return { wantsStores: STORE_QUERY.test(normalizedQuery), departments: matchedDepartments, products };
}

/**
 * Busca dentro de um departamento, mais relevantes primeiro. Só nome, código e descrição
 * contam: os termos do próprio departamento casariam com todos os produtos dele.
 * Sem termos úteis na busca, devolve `null` (nada a filtrar).
 */
export function searchProducts(products: Product[], query: string): Product[] | null {
  const terms = searchTerms(normalize(query));
  if (terms.length === 0) return null;
  return products
    .map((product) => ({ product, score: scoreFields(terms, productFields(product)) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.available) - Number(a.product.available))
    .map((entry) => entry.product);
}
