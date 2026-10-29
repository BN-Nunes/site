/** Parser de CSV (RFC 4180): lida com campos entre aspas, separadores e quebras de linha dentro deles, e aspas escapadas (""). O separador padrão é a vírgula; o CSV do Excel em português usa ";". */
export function parseCsv(text: string, delimiter = ","): Record<string, string>[] {
  const source = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === delimiter) { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  const [header, ...dataRows] = rows.filter((cells) => cells.length > 1 || cells[0] !== "");
  if (!header) return [];

  return dataRows.map((cells) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => { record[key.trim()] = (cells[index] ?? "").trim(); });
    return record;
  });
}
