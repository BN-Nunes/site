import { Icon } from "./Icon";

/**
 * Formulário GET simples para /busca: funciona mesmo antes do JavaScript
 * carregar e deixa a página de resultados buscar no catálogo ao vivo (planilha).
 */
export function SearchBar({ defaultValue = "", id = "busca" }: { defaultValue?: string; id?: string }) {
  return (
    <form className="search" role="search" action="/busca" method="get">
      <label className="sr-only" htmlFor={id}>Buscar produtos</label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="O que você está procurando?"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={80}
        required
      />
      <button type="submit" aria-label="Buscar"><Icon name="search" size={22} /></button>
    </form>
  );
}
