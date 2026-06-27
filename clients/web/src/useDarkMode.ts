import { useEffect, useState } from "react";
import { Theme, PREMIUM_THEMES, PREMIUM_THEME_COSMETIC } from "./themes.config";

export type { Theme };

const PREMIUM_CLASSES = PREMIUM_THEMES.map((p) => `theme-${p.value}`);

/**
 * Possession des thèmes, gardée EN MÉMOIRE (jamais dans le localStorage).
 * Empêche d'activer un thème premium en modifiant simplement le localStorage.
 */
let ownedThemesCache: Set<string> | null = null;

export const readTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  if (stored === "lp") return "crimson"; // compat ascendante
  if (
    stored === "light" ||
    stored === "dark" ||
    PREMIUM_THEMES.some((p) => p.value === stored)
  ) {
    return stored as Theme;
  }
  return "dark";
};

/** Thème réellement appliqué : un thème premium non confirmé retombe sur "dark". */
const effectiveTheme = (theme: Theme): Theme => {
  const required = PREMIUM_THEME_COSMETIC[theme];
  if (!required) return theme; // thème gratuit
  if (ownedThemesCache && ownedThemesCache.has(required)) return theme;
  return "dark";
};

/** Lecture "assainie" : corrige le localStorage si un thème premium non possédé y est stocké. */
const readSanitizedTheme = (): Theme => {
  const stored = readTheme();
  const required = PREMIUM_THEME_COSMETIC[stored];
  if (required && ownedThemesCache !== null && !ownedThemesCache.has(required)) {
    localStorage.setItem("theme", "dark");
    return "dark";
  }
  return stored;
};

/**
 * Applique le thème sur <html>.
 * Convention (existante) inversée : la classe `dark` = apparence CLAIRE.
 * - "dark"  -> aucune classe
 * - "light" -> classe `dark`
 * - premium -> classe `theme-<value>`
 */
export const applyTheme = (theme: Theme): void => {
  const eff = effectiveTheme(theme);
  const root = document.documentElement;
  root.classList.remove("dark", ...PREMIUM_CLASSES);
  if (eff === "light") root.classList.add("dark");
  else if (eff !== "dark") root.classList.add(`theme-${eff}`);
};

/** Change le thème globalement et prévient toutes les instances de useDarkMode. */
export const setGlobalTheme = (theme: Theme): void => {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  window.dispatchEvent(new Event("theme-changed"));
};

/** Renseigne la possession (appelé par ThemeGuard) puis ré-applique le thème. */
export const setOwnedThemes = (cosmetics: string[]): void => {
  ownedThemesCache = new Set(cosmetics);
  const stored = readTheme();
  const required = PREMIUM_THEME_COSMETIC[stored];
  if (required && !ownedThemesCache.has(required)) {
    setGlobalTheme("dark"); // non possédé -> on nettoie la préférence
  } else {
    applyTheme(stored);
    window.dispatchEvent(new Event("theme-changed"));
  }
};

export const useDarkMode = () => {
  const [theme, setThemeState] = useState<Theme>(readSanitizedTheme);

  useEffect(() => {
    const sync = (): void => setThemeState(readSanitizedTheme());
    window.addEventListener("theme-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("theme-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: Theme): void => setGlobalTheme(t);
  const toggleTheme = (): void => setGlobalTheme(theme === "dark" ? "light" : "dark");

  return { theme, toggleTheme, setTheme };
};
