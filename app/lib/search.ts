import type { Department } from "../departamentos/departments";

const departmentAliases: Record<string, string[]> = {
  baloes: ["balao", "baloes", "bexiga", "bexigas", "latex", "metalizado"],
  "festas-tematicas": ["tema", "temas", "festa infantil", "fantasia", "unicornio", "dinossauro", "aniversario"],
  confeitaria: ["bolo", "bolos", "doce", "doces", "cupcake", "cupcakes", "confeitar"],
  descartaveis: ["copo", "copos", "taca", "tacas", "canudo", "canudos", "prato", "pratos", "talher", "talheres", "guardanapo", "guardanapos"],
  decoracao: ["decorar", "decoracao", "painel", "cortina", "enfeite", "luminaria", "vaso", "arco"],
  papelaria: ["convite", "convites", "cartao", "cartoes", "sacola", "sacolas", "lembrancinha", "tag", "adesivo", "embalagem"],
  ofertas: ["oferta", "ofertas", "promocao", "promocoes", "desconto", "combo"],
};

export function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function departmentScore(department: Department, normalizedQuery: string): number {
  const terms = normalizedQuery.split(/\s+/).filter((term) => term.length > 1);
  const fields = [
    { value: department.name, weight: 12 },
    { value: departmentAliases[department.slug]?.join(" ") ?? "", weight: 11 },
    { value: department.productTypes.join(" "), weight: 9 },
    { value: department.products.map((product) => `${product.name} ${product.sku ?? ""}`).join(" "), weight: 8 },
    { value: department.products.map((product) => product.description).join(" "), weight: 4 },
    { value: `${department.shortDescription} ${department.description}`, weight: 2 },
  ].map((field) => ({ ...field, value: normalize(field.value) }));

  return terms.reduce(
    (score, term) => score + fields.reduce((termScore, field) => termScore + (field.value.includes(term) ? field.weight : 0), 0),
    0,
  );
}

export type SearchResult =
  | { type: "empty" }
  | { type: "stores" }
  | { type: "department"; slug: string }
  | { type: "not-found" };

/** Resolução de busca pura, sem efeitos colaterais (navegação fica a cargo do chamador). */
export function resolveSearch(query: string, departments: Department[]): SearchResult {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return { type: "empty" };

  if (/\b(loja|lojas|filial|filiais|endereco|enderecos)\b/.test(normalizedQuery)) {
    return { type: "stores" };
  }

  const result = departments
    .map((department) => ({ department, score: departmentScore(department, normalizedQuery) }))
    .sort((a, b) => b.score - a.score)[0];

  if (result?.score > 0) {
    return { type: "department", slug: result.department.slug };
  }

  return { type: "not-found" };
}
