export type QuoteMessageItem = {
  name: string;
  quantity: number;
  sku?: string;
};

export const MAX_QUOTE_NOTES_LENGTH = 500;

/**
 * Monta a mensagem de orçamento enviada pelo WhatsApp. Função pura — sem
 * acesso a `window`/DOM — para ser testável isoladamente.
 */
export function buildQuoteMessage(customerName: string, items: QuoteMessageItem[], notes = ""): string {
  const trimmedName = customerName.trim();
  if (items.length === 0 || !trimmedName) return "";

  const productLines = items
    .map((item, index) => [
      `${index + 1}. ${item.quantity}x ${item.name}`,
      item.sku ? `   Código: ${item.sku}` : "",
    ].filter(Boolean).join("\n"))
    .join("\n\n");

  const trimmedNotes = notes.trim().slice(0, MAX_QUOTE_NOTES_LENGTH);

  const sections = [
    `Olá! Meu nome é ${trimmedName}, gostaria de receber um orçamento dos seguintes produtos:`,
    productLines,
  ];
  if (trimmedNotes) sections.push(`Observações: ${trimmedNotes}`);
  return sections.join("\n\n");
}
