export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

/** Garante que a quantidade de um item do carrinho fique entre 1 e 99 (valores inválidos viram 1). */
export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return MIN_QUANTITY;
  return Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, Math.floor(value)));
}
