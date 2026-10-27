"use client";

import { useState } from "react";
import { Icon } from "../Icon";
import { storeMapEmbedUrl, storeMapsUrl } from "../lib/store-contact";
import type { Store } from "./stores";

/** Mapa da loja. Como no rodapé, o Google Maps só é carregado quando o visitante pede (veja a política de cookies). */
export function StoreMap({ store }: { store: Store }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="store-map">
      {showMap ? (
        <iframe
          title={`Mapa da Impakto Festas ${store.name}`}
          src={storeMapEmbedUrl(store)}
          width="600"
          height="420"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="store-map-placeholder">
          <span aria-hidden="true"><Icon name="pin" size={26} /></span>
          <strong>Impakto {store.name}</strong>
          <small>{store.street}, {store.number} — {store.city}</small>
          <button type="button" onClick={() => setShowMap(true)}>Carregar mapa</button>
          <p>O mapa é do Google e só carrega quando você pede.</p>
        </div>
      )}
      <a href={storeMapsUrl(store)} target="_blank" rel="noreferrer">Abrir no Google Maps <Icon name="external" size={16} /></a>
    </div>
  );
}
