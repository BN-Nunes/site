import descriptionsCsv from "../../catalogo/descricoes.csv?raw";
import { parseCsv } from "./csv.ts";

/**
 * Descrição de cada produto, por código, de catalogo/descricoes.csv. Foram escritas a partir do
 * nome do produto, sem inventar o que o cadastro não diz; a coluna "revisar" marca as que a equipe
 * precisa confirmar. A descrição da planilha (PRODUCTS_CSV_URL), quando existe, vale mais.
 */
export const productDescriptions = new Map(
  parseCsv(descriptionsCsv, ";").filter((row) => row.codigo && row.descricao).map((row) => [row.codigo, row.descricao]),
);
