// Códigos que não aparecem no site, venham da planilha (PRODUCTS_CSV_URL) ou da exportação do
// sistema (system-products.ts): a página do produto passa a dar 404 e ele sai do sitemap.
// Para voltar a mostrar um produto, tire o código daqui.
export const hiddenProductCodes = new Set([
  // 29/10/2026, a pedido da equipe: o cadastro não deixava claro o produto (quantidade, uso, se é comestível).
  "250545", // SACO PP CORAÇÃO AMARELO 100 X 25 X 35 CM
  "206352", // MAÇA TRANSPARENTE VERMELHO 01 UN.
  "207827", // CANETA DECORACAO PONTA FINA CORES 05 UN
  "207867", // PÓ P/ DECORAÇÃO PÉROLA 01 UN X 10 GR
]);
