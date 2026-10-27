"use client";

import { Icon } from "../Icon";
import { storeMapEmbedUrl, storeMapsUrl } from "../lib/store-contact";
import { useGoogleMap } from "../lib/use-google-map";
import type { Store } from "./stores";

/** Mapa da loja. Carrega sozinho, como o do rodapé, exceto para quem escolheu "Somente necessários" (veja `useGoogleMap`). */
export function StoreMap({ store }: { store: Store }) {
  const map = useGoogleMap();

  return (
    <div className="store-map">
      {map.state === "map" ? (
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
          {map.state === "button" && (
            <>
              <button type="button" onClick={map.load}>Carregar mapa</button>
              <p>Você escolheu só os cookies necessários, então o mapa do Google carrega quando você pedir.</p>
            </>
          )}
        </div>
      )}
      <a href={storeMapsUrl(store)} target="_blank" rel="noreferrer">Abrir no Google Maps <Icon name="external" size={16} /></a>
    </div>
  );
}
