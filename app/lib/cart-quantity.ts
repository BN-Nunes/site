export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

/** Garante que a quantidade de um item do carrinho fique entre 1 e 99. */
export function clampQuantity(value: number): number {
  return Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, Math.floor(value)));
}
