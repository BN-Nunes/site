"use client";

export type CookieConsent = "necessary" | "functional";

const CONSENT_KEY = "impakto-cookie-consent-v1";
const THEME_KEY = "impakto-theme";
const CART_KEY = "impakto-orcamento";
const CONSENT_EVENT = "impakto:cookie-consent-changed";
const OPEN_PREFERENCES_EVENT = "impakto:open-cookie-preferences";

export function getStoredConsent(): CookieConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "necessary" || value === "functional" ? value : null;
  } catch {
    return null;
  }
}

export function isFunctionalAllowed(): boolean {
  return getStoredConsent() === "functional";
}

export function setConsent(consent: CookieConsent): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, consent);
    if (consent === "necessary") {
      // Minimização de dados: remove o que só deveria existir com consentimento funcional.
      window.localStorage.removeItem(THEME_KEY);
      window.localStorage.removeItem(CART_KEY);
    }
  } finally {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
  }
}

export function onConsentChange(callback: (consent: CookieConsent) => void): () => void {
  function handler(event: Event) {
    callback((event as CustomEvent<CookieConsent>).detail);
  }
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

export function onOpenPreferencesRequest(callback: () => void): () => void {
  window.addEventListener(OPEN_PREFERENCES_EVENT, callback);
  return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, callback);
}
