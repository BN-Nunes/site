"use client";

import Form from "next/form";
import { useState } from "react";
import { Icon } from "../Icon";
import { MAX_QUERY_LENGTH } from "../lib/search";

/**
 * Busca dentro do departamento. É um formulário GET comum (funciona antes do JavaScript);
 * com ele, os resultados chegam sem recarregar a página nem voltar ao topo.
 */
export function DepartmentSearch({ action, departmentName, query }: { action: string; departmentName: string; query: string }) {
  const [value, setValue] = useState(query);
  const [previousQuery, setPreviousQuery] = useState(query);
  // "Limpar busca" e o voltar do navegador trocam a busca da página: o campo acompanha.
  if (query !== previousQuery) {
    setPreviousQuery(query);
    setValue(query);
  }

  return (
    <Form className="search department-search-form" role="search" action={action} scroll={false}>
      <label className="sr-only" htmlFor="busca-departamento">Buscar em {departmentName}</label>
      <input
        id="busca-departamento"
        name="busca"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={`Buscar em ${departmentName}`}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={MAX_QUERY_LENGTH}
      />
      <button type="submit" aria-label={`Buscar em ${departmentName}`}><Icon name="search" size={22} /></button>
    </Form>
  );
}
