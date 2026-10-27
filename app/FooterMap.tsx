"use client";

import { Icon } from "./Icon";
import { useGoogleMap } from "./lib/use-google-map";

const mapEmbedUrl = "https://www.google.com/maps?q=Estrada%20do%20Embu%2C%20320%2C%20Jardim%20Torino%2C%20Cotia%2C%20SP%2C%2006713-100&output=embed";
const mapLinkUrl = "https://www.google.com/maps/search/?api=1&query=Estrada%20do%20Embu%2C%20320%2C%20Jardim%20Torino%2C%20Cotia%2C%20SP%2C%2006713-100";

export function FooterMap() {
  const map = useGoogleMap();

  return (
    <section className="footer-map-card" aria-label="Localização da Impakto Festas">
      {map.state === "map" ? (
        <iframe
          title="Mapa da Impakto Festas em Cotia"
          src={mapEmbedUrl}
          width="600"
          height="190"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="footer-map-placeholder">
          <span><Icon name="pin" size={22} /></span>
          <div><strong>Impakto Cotia</strong><small>Estr. do Embu, 320</small></div>
          {map.state === "button" && <button type="button" onClick={map.load}>Carregar mapa</button>}
        </div>
      )}
      <a href={mapLinkUrl} target="_blank" rel="noreferrer">Abrir no Google Maps ↗</a>
    </section>
  );
}
