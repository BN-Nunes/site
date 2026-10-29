import { departments as staticDepartments, type Department } from "../departamentos/departments.ts";
import { systemProductRows } from "../departamentos/system-products.ts";
import { parseCsv } from "./csv.ts";
import { mapCsvRowsToDepartments, mergeCatalogRows } from "./product-catalog.ts";

const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

let cache: { expiresAt: number; departments: Department[] } | null = null;

const withoutSheet = mapCsvRowsToDepartments(systemProductRows, staticDepartments);

/**
 * Departamentos com os produtos da planilha configurada em PRODUCTS_CSV_URL (com
 * cache de alguns minutos) mais os produtos com foto da exportação do sistema
 * (system-products.ts). Sem a variável configurada, ou se a busca/planilha falhar,
 * ficam só os do sistema — o catálogo nunca fica fora do ar por causa de uma
 * planilha indisponível ou mal formatada. Departamento sem nenhum dos dois mostra
 * os produtos de exemplo de departments.ts.
 */
export async function getDepartmentsWithLiveProducts(): Promise<Department[]> {
  const csvUrl = process.env.PRODUCTS_CSV_URL?.trim();
  if (!csvUrl) return withoutSheet;

  if (cache && cache.expiresAt > Date.now()) return cache.departments;

  try {
    const response = await fetch(csvUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Planilha de produtos respondeu ${response.status}`);

    const rows = parseCsv(await response.text());
    const merged = mapCsvRowsToDepartments(mergeCatalogRows(rows, systemProductRows), staticDepartments);
    cache = { expiresAt: Date.now() + CACHE_TTL_MS, departments: merged };
    return merged;
  } catch (error) {
    console.error("Falha ao buscar a planilha de produtos, usando só os produtos do sistema:", error);
    return withoutSheet;
  }
}
