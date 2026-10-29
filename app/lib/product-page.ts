import { departments as staticDepartments, type Department, type Product } from "../departamentos/departments.ts";
import { slugifyId } from "./product-catalog.ts";
import { normalize, searchTerms } from "./search.ts";

export type ProductMatch = { product: Product; department: Department };

/** Endereço da página do produto: nome e código, para o link dizer o que é e continuar único. */
export function productPath(product: Product): string {
  return `/produtos/${slugifyId(product.name)}-${slugifyId(product.sku || product.id)}`;
}

/**
 * Acha o produto pelo endereço. Quando o nome mudou na planilha, o endereço antigo ainda
 * termina com o código: o produto é achado com `canonical: false`, para redirecionar.
 */
export function findProduct(departments: Department[], slug: string): (ProductMatch & { canonical: boolean }) | null {
  let byCode: (ProductMatch & { canonical: boolean }) | null = null;
  for (const department of departments) {
    for (const product of department.products) {
      if (productPath(product) === `/produtos/${slug}`) return { product, department, canonical: true };
      byCode ??= slug.endsWith(`-${slugifyId(product.sku || product.id)}`) ? { product, department, canonical: false } : null;
    }
  }
  return byCode;
}

const demoProductIds = new Set(staticDepartments.flatMap((department) => department.products.map((product) => product.id)));

/** Os produtos de exemplo de departments.ts (o que um departamento sem produtos de verdade mostra) não vão para o Google. */
export function isDemoProduct(product: Product): boolean {
  return demoProductIds.has(product.id);
}

/** Quantidades e medidas ("01 UN X 20 GR") aparecem em quase todo nome: não dizem se dois produtos se parecem. */
const MEASURE_WORDS = new Set(["un", "und", "unid", "x", "pct", "pc", "pcs", "cx", "dp", "gr", "g", "kg", "ml", "l", "lt", "cm", "mm", "mt", "m", "ref", "mod", "n"]);

function nameWords(product: Product): Set<string> {
  return new Set(searchTerms(normalize(product.name).replace(/[^a-z0-9]+/g, " ")).filter((word) => !/\d/.test(word) && !MEASURE_WORDS.has(word)));
}

/**
 * Os produtos do departamento com o nome mais parecido, primeiro os outros tamanhos e cores do
 * mesmo item ("FANTASIA … PALHACO P/M/G REF 23680"): proporção de palavras em comum no nome.
 */
export function similarProducts(product: Product, department: Department, limit = 8): Product[] {
  const words = nameWords(product);
  return department.products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      const other = nameWords(candidate);
      const shared = [...other].filter((word) => words.has(word)).length;
      return { candidate, score: shared / (words.size + other.size - shared || 1) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
