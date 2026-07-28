"use client";

import { useEffect, useState } from "react";
import { isFunctionalAllowed } from "./lib/cookie-consent";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o atributo definido pelo script de tema pré-hidratação; ler no render causaria mismatch de hidratação.
    setTheme(current);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    if (isFunctionalAllowed()) window.localStorage.setItem("impakto-theme", nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <span aria-hidden="true">{theme === null ? "◐" : isDark ? "☀" : "☾"}</span>
    </button>
  );
}
