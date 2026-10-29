import type { Department, Product } from "../departamentos/departments.ts";
import { normalize } from "./search.ts";

const AVAILABLE_VALUES = new Set(["sim", "true", "1", "yes", "disponivel"]);

export function slugifyId(value: string): string {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeHeader(header: string): string {
  return normalize(header).replace(/\s+/g, "");
}

/** Lê uma coluna por qualquer um dos nomes alternativos, ignorando acentos, caixa e espaços no cabeçalho — planilhas de clientes raramente usam exatamente os nomes do modelo. */
function pick(row: Record<string, string>, ...aliases: string[]): string | undefined {
  const wanted = new Set(aliases.map(normalizeHeader));
  for (const [key, value] of Object.entries(row)) {
    if (wanted.has(normalizeHeader(key)) && value?.trim()) return value.trim();
  }
  return undefined;
}

function toProduct(row: Record<string, string>, departmentSlug: string): Product | null {
  const explicitName = pick(row, "nome");
  const description = pick(row, "descricao");
  const name = explicitName ?? description;
  if (!name) return null;

  const sku = pick(row, "sku", "codigo");
  const availability = pick(row, "disponivel");

  return {
    id: `${departmentSlug}-${slugifyId(sku || name)}`,
    sku,
    name,
    // Quando não há coluna "nome", a descrição já foi usada como nome — não duplica como descrição também.
    description: explicitName ? (description ?? "") : "",
    price: pick(row, "preco") ?? "",
    image: pick(row, "imagem", "url imagem") ?? "",
    // Sem coluna "disponivel" na planilha, assume disponível — a maioria dos clientes não controla estoque por aqui.
    available: availability === undefined || AVAILABLE_VALUES.has(normalize(availability)),
  };
}

/** Linhas da planilha seguidas das linhas do sistema cujo código a planilha ainda não tem: a planilha manda no produto que as duas trazem. */
export function mergeCatalogRows(sheetRows: Record<string, string>[], systemRows: Record<string, string>[]): Record<string, string>[] {
  const sheetSkus = new Set(sheetRows.map((row) => pick(row, "sku", "codigo")).filter(Boolean));
  return [...sheetRows, ...systemRows.filter((row) => !sheetSkus.has(pick(row, "sku", "codigo")))];
}

/** Linhas sem os códigos escondidos do site. */
export function withoutCodes(rows: Record<string, string>[], codes: Set<string>): Record<string, string>[] {
  return rows.filter((row) => !codes.has(pick(row, "sku", "codigo") ?? ""));
}

/** Preenche a descrição pelo código nas linhas que não têm a sua: a descrição da planilha vale mais. */
export function withDescriptions(rows: Record<string, string>[], descriptions: Map<string, string>): Record<string, string>[] {
  return rows.map((row) => {
    const description = descriptions.get(pick(row, "sku", "codigo") ?? "");
    if (!description) return row;
    if (pick(row, "nome")) return pick(row, "descricao") ? row : { ...row, descricao: description };
    // Sem coluna "nome" (como na planilha de hoje), a "descrição" da planilha é o nome do produto.
    const name = pick(row, "descricao");
    if (!name) return row;
    const withoutName = Object.fromEntries(Object.entries(row).filter(([key]) => normalizeHeader(key) !== "descricao"));
    return { ...withoutName, nome: name, descricao: description };
  });
}

/**
 * Mescla linhas de uma planilha de produtos nos departamentos existentes, casando
 * a coluna "departamento" pelo nome (sem diferenciar maiúsculas/acentos). Departamentos
 * sem nenhuma linha na planilha, ou linhas com departamento desconhecido/dados
 * incompletos, mantêm seus produtos estáticos como fallback.
 */
export function mapCsvRowsToDepartments(rows: Record<string, string>[], baseDepartments: Department[]): Department[] {
  const productsBySlug = new Map<string, Product[]>();

  for (const row of rows) {
    const departmentName = pick(row, "departamento");
    if (!departmentName) continue;

    const department = baseDepartments.find((candidate) => normalize(candidate.name) === normalize(departmentName));
    if (!department) continue;

    const product = toProduct(row, department.slug);
    if (!product) continue;

    const list = productsBySlug.get(department.slug) ?? [];
    list.push(product);
    productsBySlug.set(department.slug, list);
  }

  return baseDepartments.map((department) => {
    const products = productsBySlug.get(department.slug);
    return products ? { ...department, products } : department;
  });
}
