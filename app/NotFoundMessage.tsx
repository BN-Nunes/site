"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { productSearchFromPath } from "./lib/not-found";

/** Título, texto e busca da página 404. Num link de produto que saiu do site, já sugere a busca pelo nome dele. */
export function NotFoundMessage() {
  const productSearch = productSearchFromPath(usePathname() ?? "");
  const isProduct = productSearch !== null;
  const title = isProduct ? "Este produto não está mais no site" : "Página não encontrada";
  // O vinext monta o <head> da 404 só com o metadata dos layouts (o título da home): o título da aba vem daqui.
  useEffect(() => {
    document.title = `${title} | Impakto Festas`;
  }, [title]);
  return (
    <>
      <h1 id="not-found-title">{title}</h1>
      <p className="not-found-text">
        {isProduct
          ? "Ele pode ter saído do catálogo. Veja se temos algo parecido:"
          : "O endereço que você abriu não existe ou mudou. Busque o que você precisa:"}
      </p>
      <div className="not-found-search"><SearchBar id="busca-404" defaultValue={productSearch ?? ""} /></div>
    </>
  );
}
