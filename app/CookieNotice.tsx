"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredConsent, onOpenPreferencesRequest, setConsent } from "./lib/cookie-consent";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do localStorage (indisponível no SSR) para decidir se o aviso aparece, sem causar mismatch de hidratação.
    setVisible(getStoredConsent() === null);
    return onOpenPreferencesRequest(() => setVisible(true));
  }, []);

  function choose(consent: "necessary" | "functional") {
    setConsent(consent);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="cookie-notice" role="region" aria-label="Preferências de cookies e armazenamento local">
      <div className="cookie-notice-icon" aria-hidden="true">🍪</div>
      <div className="cookie-notice-copy">
        <strong>Privacidade e cookies</strong>
        <p>
          Usamos cookies necessários para manter sua sessão. Com sua permissão, também
          lembramos seu carrinho de orçamento e sua preferência de tema entre visitas.
          Os mapas das lojas vêm do Google Maps e carregam com a página; com
          &quot;Somente necessários&quot;, só carregam quando você pedir.
        </p>
      </div>
      <div className="cookie-notice-actions">
        <Link href="/politica-de-cookies">Ver política</Link>
        <button type="button" className="cookie-notice-secondary" onClick={() => choose("necessary")}>Somente necessários</button>
        <button type="button" onClick={() => choose("functional")}>Aceitar funcionalidades</button>
      </div>
    </aside>
  );
}
