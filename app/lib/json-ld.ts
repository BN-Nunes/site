/**
 * Serializa JSON-LD para dentro de um <script>. Escapa `<`, `>` e `&` para que
 * um texto vindo da planilha de produtos (ex.: um nome com "</script>") não
 * consiga fechar a tag e injetar HTML na página.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
