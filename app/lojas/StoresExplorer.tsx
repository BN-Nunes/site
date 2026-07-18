"use client";

import { useMemo, useState } from "react";
import { storeAddress, stores } from "./stores";

const cities = Array.from(new Set(stores.map((store) => store.city))).sort((a, b) => a.localeCompare(b, "pt-BR"));

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function StoresExplorer() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Todas as cidades");

  const filteredStores = useMemo(() => {
    const term = normalize(query);
    return stores.filter((store) => {
      const matchesCity = city === "Todas as cidades" || store.city === city;
      const searchable = normalize(`${store.name} ${store.city} ${store.street} ${store.cep} ${store.cnpj}`);
      return matchesCity && (!term || searchable.includes(term));
    });
  }, [query, city]);

  function clearFilters() {
    setQuery("");
    setCity("Todas as cidades");
  }

  return (
    <>
      <div className="stores-filters" role="search" aria-label="Buscar filiais">
        <label className="store-search-field">
          <span>Buscar uma unidade</span>
          <div><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, cidade, endereço ou CEP" /></div>
        </label>
        <label className="store-city-field">
          <span>Filtrar por cidade</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            <option>Todas as cidades</option>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="stores-result-heading">
        <div><strong>{filteredStores.length}</strong><span>{filteredStores.length === 1 ? "filial encontrada" : "filiais encontradas"}</span></div>
        {(query || city !== "Todas as cidades") && <button type="button" onClick={clearFilters}>Limpar filtros</button>}
      </div>

      {filteredStores.length > 0 ? (
        <div className="stores-grid">
          {filteredStores.map((store, index) => {
            const address = storeAddress(store);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Impakto Festas ${address}`)}`;
            return (
              <article className="store-card" key={store.cnpj}>
                <div className="store-card-top"><span className="store-number">{String(index + 1).padStart(2, "0")}</span><span className="store-status"><i /> Unidade ativa</span></div>
                <h2>Impakto {store.name}</h2>
                <address><span aria-hidden="true">⌖</span><span>{store.street}, {store.number}<br />{store.city} — {store.state}<br />CEP {store.cep}</span></address>
                <p className="store-cnpj"><span>CNPJ</span>{store.cnpj}</p>
                <a className="store-map-button" href={mapsUrl} target="_blank" rel="noreferrer">Como chegar <span aria-hidden="true">↗</span></a>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="stores-empty"><span aria-hidden="true">⌕</span><h2>Nenhuma filial encontrada</h2><p>Tente buscar por outra cidade, endereço ou CEP.</p><button type="button" onClick={clearFilters}>Ver todas as filiais</button></div>
      )}
    </>
  );
}

