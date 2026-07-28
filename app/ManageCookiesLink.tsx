"use client";

import { openCookiePreferences } from "./lib/cookie-consent";

export function ManageCookiesLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openCookiePreferences}>
      Gerenciar cookies
    </button>
  );
}
