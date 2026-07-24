"use client";

import { FormEvent, useState } from "react";
import { departments, type Department } from "./departamentos/departments";

const departmentAliases: Record<string, string[]> = {
  baloes: ["balao", "baloes", "bexiga", "bexigas", "latex", "metalizado"],
  "festas-tematicas": ["tema", "temas", "festa infantil", "fantasia", "unicornio", "dinossauro", "aniversario"],
  confeitaria: ["bolo", "bolos", "doce", "doces", "cupcake", "cupcakes", "confeitar"],
  descartaveis: ["copo", "copos", "taca", "tacas", "canudo", "canudos", "prato", "pratos", "talher", "talheres", "guardanapo", "guardanapos"],
  decoracao: ["decorar", "decoracao", "painel", "cortina", "enfeite", "luminaria", "vaso", "arco"],
  papelaria: ["convite", "convites", "cartao", "cartoes", "sacola", "sacolas", "lembrancinha", "tag", "adesivo", "embalagem"],
  ofertas: ["oferta", "ofertas", "promocao", "promocoes", "desconto", "combo"],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function departmentScore(department: Department, query: string) {
  const terms = query.split(/\s+/).filter((term) => term.length > 1);
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

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      setMessage("Digite o produto que você procura.");
      return;
    }

    if (/\b(loja|lojas|filial|filiais|endereco|enderecos)\b/.test(normalizedQuery)) {
      window.location.assign("/lojas");
      return;
    }

    const result = departments
      .map((department) => ({ department, score: departmentScore(department, normalizedQuery) }))
      .sort((a, b) => b.score - a.score)[0];

    if (result?.score > 0) {
      window.location.assign(`/departamentos/${result.department.slug}`);
      return;
    }

    setMessage("Produto não encontrado. Tente buscar por copos, balões, confeitaria ou decoração.");
  }

  return (
    <div className="search-wrapper">
      <form className="search" role="search" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="busca">Buscar produtos</label>
        <input
          id="busca"
          name="q"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (message) setMessage("");
          }}
          placeholder="O que você está procurando?"
          autoComplete="off"
        />
        <button type="submit" aria-label="Buscar">⌕</button>
      </form>
      {message ? <span className="search-feedback" role="status">{message}</span> : null}
    </div>
  );
}
