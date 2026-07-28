"use client";

import { FormEvent, useState } from "react";
import { departments } from "./departamentos/departments";
import { resolveSearch } from "./lib/search";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = resolveSearch(query, departments);

    switch (result.type) {
      case "empty":
        setMessage("Digite o produto que você procura.");
        return;
      case "stores":
        window.location.assign("/lojas");
        return;
      case "department":
        window.location.assign(`/departamentos/${result.slug}`);
        return;
      case "not-found":
        setMessage("Produto não encontrado. Tente buscar por copos, balões, confeitaria ou decoração.");
    }
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
