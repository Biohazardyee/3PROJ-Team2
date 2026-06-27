import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "lp";

/**
 * Applique le thème sur <html>.
 * Convention (existante) inversée : la classe `dark` = apparence CLAIRE.
 * - "dark"  -> aucune classe (apparence sombre par défaut)
 * - "light" -> classe `dark` (apparence claire)
 * - "lp"    -> classe `theme-lp` (thème Linkin Park, basé sur le sombre)
 */
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  root.classList.remove("dark", "theme-lp");
  if (theme === "light") root.classList.add("dark");
  else if (theme === "lp") root.classList.add("theme-lp");
};

/** Change le thème globalement et prévient toutes les instances de useDarkMode. */
export const setGlobalTheme = (theme: Theme): void => {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  window.dispatchEvent(new Event("theme-changed"));
};

const readTheme = (): Theme => (localStorage.getItem("theme") as Theme) || "dark";

export const useDarkMode = () => {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    const sync = (): void => setThemeState(readTheme());
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
