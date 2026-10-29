/** Palavras do endereço que não ajudam a buscar: unidades, referências e ligações ("com", "para"). */
const IGNORED_WORDS = new Set(["und", "unid", "pct", "pcs", "ref", "mod", "com", "para", "das", "dos", "sem"]);

/**
 * Num endereço de produto (/produtos/<nome>-<código>), as três primeiras palavras do nome, para sugerir
 * uma busca quando o produto saiu do site: "/produtos/toalha-de-mesa-lisa-amarelo-01-un-x-1-40-x-2-20-cm-204522"
 * vira "toalha mesa lisa", e as primeiras da busca são as outras toalhas lisas. Ficam de fora números,
 * medidas e palavras com menos de 3 letras ("pó" acharia "pote" e "poá"). Fora de /produtos/, devolve `null`.
 */
export function productSearchFromPath(pathname: string): string | null {
  const slug = pathname.match(/^\/produtos\/([^/?#]+)/)?.[1];
  if (slug === undefined) return null;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // Endereço com "%" inválido: usa como veio.
  }
  return decoded
    .split("-")
    .filter((word) => word.length > 2 && !/\d/.test(word) && !IGNORED_WORDS.has(word))
    .slice(0, 3)
    .join(" ");
}
