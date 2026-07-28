export type QuoteMessageItem = {
  name: string;
  quantity: number;
  sku?: string;
};

/**
 * Monta a mensagem de orçamento enviada pelo WhatsApp. Função pura — sem
 * acesso a `window`/DOM — para ser testável isoladamente.
 */
export function buildQuoteMessage(customerName: string, items: QuoteMessageItem[]): string {
  const trimmedName = customerName.trim();
  if (items.length === 0 || !trimmedName) return "";

  const productLines = items
    .map((item, index) => [
      `${index + 1}. ${item.quantity}x ${item.name}`,
      item.sku ? `   Código: ${item.sku}` : "",
    ].filter(Boolean).join("\n"))
    .join("\n\n");

  return [
    `Olá! Meu nome é ${trimmedName}, gostaria de receber um orçamento dos seguintes produtos:`,
    "",
    productLines,
  ].filter(Boolean).join("\n");
}
