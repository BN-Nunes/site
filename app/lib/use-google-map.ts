"use client";

import { useState, useSyncExternalStore } from "react";
import { getStoredConsent, onConsentChange } from "./cookie-consent";

export type GoogleMapState = "pending" | "map" | "button";

/**
 * Se o mapa do Google aparece. Ele carrega sozinho para todo mundo, menos para quem
 * escolheu "Somente necessários" no aviso de cookies: para essa pessoa o mapa espera o
 * clique em "Carregar mapa" (`load`). No servidor e até a hidratação a escolha ainda não
 * é conhecida ("pending"), então nada do Google é carregado antes de saber se pode.
 */
export function useGoogleMap(): { state: GoogleMapState; load: () => void } {
  const consent = useSyncExternalStore(onConsentChange, getStoredConsent, () => undefined);
  const [requested, setRequested] = useState(false);
  const state: GoogleMapState = consent === undefined ? "pending" : consent === "necessary" && !requested ? "button" : "map";
  return { state, load: () => setRequested(true) };
}
