import { Icon } from "../Icon";
import { storeMapsUrl, storePhoneLink, storeWhatsappLink } from "../lib/store-contact";
import type { Store } from "./stores";

/** Botões de contato de uma loja: rota no Google Maps, WhatsApp e, quando a loja tem fixo, ligação. */
export function StoreActions({ store, className }: { store: Store; className?: string }) {
  const whatsapp = storeWhatsappLink(store);
  const phone = storePhoneLink(store);
  return (
    <div className={["store-actions", phone && "has-phone", className].filter(Boolean).join(" ")}>
      <a className="store-map-button" href={storeMapsUrl(store)} target="_blank" rel="noreferrer">Como chegar <Icon name="external" size={16} /></a>
      <a
        className="store-whatsapp-button"
        href={whatsapp.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Falar com a Impakto ${store.name} pelo WhatsApp ${whatsapp.display}${whatsapp.direct ? "" : " (atendimento central)"}`}
      >
        <img src="/whatsapp-logo.png" alt="" width={200} height={200} loading="lazy" decoding="async" /> WhatsApp
      </a>
      {phone && <a className="store-call-button" href={phone.href} aria-label={`Ligar para a Impakto ${store.name}: ${phone.display}`}><Icon name="phone" size={16} /> Ligar</a>}
    </div>
  );
}
