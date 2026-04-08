import { useState, useEffect } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "soundmap_theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
