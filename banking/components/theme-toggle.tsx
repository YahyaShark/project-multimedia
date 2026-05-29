import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const storageKey = "novabank-theme";

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(storageKey);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const preferredTheme = getPreferredTheme();

    setTheme(preferredTheme);
    document.documentElement.dataset.theme = preferredTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
  };

  return (
    <button
      aria-label={`Aktifkan mode ${theme === "light" ? "gelap" : "terang"}`}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle-track">
        <span className="theme-toggle-thumb" />
      </span>
      <span>{theme === "light" ? "Light" : "Dark"}</span>
    </button>
  );
}
