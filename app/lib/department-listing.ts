import type { Product } from "../departamentos/departments.ts";
import { searchProducts } from "./search.ts";

/** Produtos por vez na página do departamento. Fecha as linhas da grade com 2, 3, 4 ou 6 colunas. */
export const PRODUCTS_PER_PAGE = 24;

export type DepartmentListing = {
  /** Produtos das páginas 1 até `page`: "carregar mais" soma a próxima página às anteriores. */
  products: Product[];
  /** Total de produtos da busca, ou do departamento quando não há busca. */
  matching: number;
  /** A busca tinha termos úteis e filtrou o departamento. */
  searching: boolean;
  page: number;
  /** Próxima página, ou `null` quando todos os produtos já aparecem. */
  nextPage: number | null;
};

/** Lê `?pagina=`: qualquer coisa que não seja um inteiro positivo vira a página 1. */
export function readPageParam(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** Os itens das páginas 1 até a pedida, que nunca passa da última. */
export function paginate<T>(items: T[], requestedPage: number): { items: T[]; page: number; nextPage: number | null } {
  const lastPage = Math.max(1, Math.ceil(items.length / PRODUCTS_PER_PAGE));
  const page = Math.min(requestedPage, lastPage);
  return { items: items.slice(0, page * PRODUCTS_PER_PAGE), page, nextPage: page < lastPage ? page + 1 : null };
}

/** Filtra os produtos do departamento pela busca e corta até a página pedida (que nunca passa da última). */
export function listDepartmentProducts(products: Product[], query: string, requestedPage: number): DepartmentListing {
  const found = searchProducts(products, query);
  const matches = found ?? products;
  const { items, page, nextPage } = paginate(matches, requestedPage);
  return { products: items, matching: matches.length, searching: found !== null, page, nextPage };
}

/** Endereço do departamento com a busca e a página, sem parâmetros vazios. */
export function departmentListingHref(slug: string, query: string, page = 1): string {
  const params = new URLSearchParams();
  if (query) params.set("busca", query);
  if (page > 1) params.set("pagina", String(page));
  const search = params.toString();
  return `/departamentos/${slug}${search ? `?${search}` : ""}`;
}
