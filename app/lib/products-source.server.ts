import { departments as staticDepartments, type Department } from "../departamentos/departments.ts";
import { parseCsv } from "./csv.ts";
import { mapCsvRowsToDepartments } from "./product-catalog.ts";

const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

let cache: { expiresAt: number; departments: Department[] } | null = null;

/**
 * Departamentos com produtos vindos da planilha configurada em PRODUCTS_CSV_URL,
 * com cache de alguns minutos. Sem a variável configurada, ou se a busca/planilha
 * falhar, volta para os produtos estáticos em departments.ts — o catálogo nunca
 * fica fora do ar por causa de uma planilha indisponível ou mal formatada.
 */
export async function getDepartmentsWithLiveProducts(): Promise<Department[]> {
  const csvUrl = process.env.PRODUCTS_CSV_URL?.trim();
  if (!csvUrl) return staticDepartments;

  if (cache && cache.expiresAt > Date.now()) return cache.departments;

  try {
    const response = await fetch(csvUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Planilha de produtos respondeu ${response.status}`);

    const rows = parseCsv(await response.text());
    const merged = mapCsvRowsToDepartments(rows, staticDepartments);
    cache = { expiresAt: Date.now() + CACHE_TTL_MS, departments: merged };
    return merged;
  } catch (error) {
    console.error("Falha ao buscar a planilha de produtos, usando catálogo estático:", error);
    return staticDepartments;
  }
}
