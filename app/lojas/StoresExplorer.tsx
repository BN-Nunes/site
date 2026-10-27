"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StoreActions } from "./StoreActions";
import { storeSlug, stores } from "./stores";
import { formatDistanceKm, sortByDistance, type Coordinates } from "../lib/geolocation";
import { normalize } from "../lib/search";
import { storePhoneLink, storeWhatsappLink } from "../lib/store-contact";
import { Icon } from "../Icon";

const cities = Array.from(new Set(stores.map((store) => store.city))).sort((a, b) => a.localeCompare(b, "pt-BR"));

type LocationState = "idle" | "loading" | "granted" | "denied" | "unsupported" | "error";

export function StoresExplorer() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Todas as cidades");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("idle");

  const filteredStores = useMemo(() => {
    const term = normalize(query);
    const matches = stores.filter((store) => {
      const matchesCity = city === "Todas as cidades" || store.city === city;
      const searchable = normalize(`${store.name} ${store.city} ${store.street} ${store.cep} ${store.cnpj}`);
      return matchesCity && (!term || searchable.includes(term));
    });
    return location
      ? sortByDistance(matches, location)
      : matches.map((store) => ({ ...store, distanceKm: undefined as number | undefined }));
  }, [query, city, location]);

  function clearFilters() {
    setQuery("");
    setCity("Todas as cidades");
  }

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationState("unsupported");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationState("granted");
      },
      (error) => {
        setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pede a localização assim que a página abre, por decisão de produto; navegadores não repetem o prompt depois de um grant/deny anterior.
    requestLocation();
  }, [requestLocation]);

  function clearLocation() {
    setLocation(null);
    setLocationState("idle");
  }

  return (
    <>
      <div className="stores-filters" role="search" aria-label="Buscar filiais">
        <label className="store-search-field">
          <span>Buscar uma unidade</span>
          <div><Icon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, cidade, endereço ou CEP" /></div>
        </label>
        <label className="store-city-field">
          <span>Filtrar por cidade</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            <option>Todas as cidades</option>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="stores-location">
        {location ? (
          <button type="button" className="stores-location-button is-active" onClick={clearLocation}>
            <Icon name="locate" size={18} /> Ordenado pela loja mais próxima <Icon name="close" size={16} />
          </button>
        ) : (
          <button type="button" className="stores-location-button" onClick={requestLocation} disabled={locationState === "loading"}>
            <Icon name="locate" size={18} /> {locationState === "loading" ? "Localizando…" : "Usar minha localização"}
          </button>
        )}
        {locationState === "granted" && (
          <span className="sr-only" role="status">Filiais ordenadas da mais próxima para a mais distante de você.</span>
        )}
        {locationState === "denied" && (
          <span className="stores-location-feedback" role="status">Permissão de localização negada. Ative nas configurações do navegador para ver a filial mais próxima de você.</span>
        )}
        {locationState === "unsupported" && (
          <span className="stores-location-feedback" role="status">Seu navegador não oferece suporte a localização automática.</span>
        )}
        {locationState === "error" && (
          <span className="stores-location-feedback" role="status">Não foi possível obter sua localização agora. Tente novamente.</span>
        )}
      </div>

      <div className="stores-result-heading">
        <div><strong>{filteredStores.length}</strong><span>{filteredStores.length === 1 ? "filial encontrada" : "filiais encontradas"}</span></div>
        {(query || city !== "Todas as cidades") && <button type="button" onClick={clearFilters}>Limpar filtros</button>}
      </div>

      {filteredStores.length > 0 ? (
        <div className="stores-grid">
          {filteredStores.map((store, index) => {
            const storeUrl = `/lojas/${storeSlug(store)}`;
            const distanceKm = store.distanceKm;
            const whatsapp = storeWhatsappLink(store);
            const phone = storePhoneLink(store);
            return (
              <article className="store-card" key={store.cnpj}>
                {/* A foto leva à mesma página do título; fica fora da navegação por teclado para não repetir o link. */}
                <Link className="store-photo" href={storeUrl} tabIndex={-1} aria-hidden="true">
                  {store.photo
                    ? <img src={store.photo} alt="" width={800} height={480} loading="lazy" decoding="async" />
                    : <span>Impakto {store.name}</span>}
                </Link>
                <div className="store-card-top">
                  <span className="store-number">{String(index + 1).padStart(2, "0")}</span>
                  {index === 0 && distanceKm !== undefined ? (
                    <span className="store-status store-status-nearest"><i /> Mais próxima de você</span>
                  ) : (
                    <span className="store-status"><i /> Unidade ativa</span>
                  )}
                </div>
                <h2><Link href={storeUrl}>Impakto {store.name}</Link></h2>
                <address><Icon name="pin" size={20} /><span>{store.street}, {store.number}<br />{store.city} — {store.state}<br />CEP {store.cep}</span></address>
                <div className="store-meta">
                  <p className="store-cnpj"><span>CNPJ</span>{store.cnpj}</p>
                  <p className="store-cnpj"><span>WhatsApp</span>{whatsapp.direct ? whatsapp.display : "Pela central"}</p>
                  {phone && <p className="store-cnpj"><span>Telefone</span>{phone.display}</p>}
                </div>
                {distanceKm !== undefined && <p className="store-distance">A {formatDistanceKm(distanceKm)} de você</p>}
                <StoreActions store={store} />
              </article>
            );
          })}
        </div>
      ) : (
        <div className="stores-empty"><span aria-hidden="true"><Icon name="search" size={40} /></span><h2>Nenhuma filial encontrada</h2><p>Tente buscar por outra cidade, endereço ou CEP.</p><button type="button" onClick={clearFilters}>Ver todas as filiais</button></div>
      )}
    </>
  );
}

