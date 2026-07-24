"use client";

import { useEffect, useState } from "react";

const NOTICE_KEY = "impakto-cookie-notice-v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(NOTICE_KEY) !== "acknowledged");
    } catch {
      setVisible(true);
    }
  }, []);

  function acknowledge() {
    try {
      window.localStorage.setItem(NOTICE_KEY, "acknowledged");
    } finally {
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <aside className="cookie-notice" role="region" aria-label="Aviso sobre cookies e armazenamento local">
      <div className="cookie-notice-icon" aria-hidden="true">🍪</div>
      <div className="cookie-notice-copy">
        <strong>Privacidade e cookies</strong>
        <p>
          Usamos apenas recursos necessários e de funcionalidade para manter sua sessão,
          seu carrinho de orçamento e suas preferências. O Google Maps só é carregado
          quando você escolhe abrir o mapa.
        </p>
      </div>
      <div className="cookie-notice-actions">
        <a href="/politica-de-cookies">Ver política</a>
        <button type="button" onClick={acknowledge}>Entendi</button>
      </div>
    </aside>
  );
}
