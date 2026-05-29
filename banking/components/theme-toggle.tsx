"use client";

import { useTheme } from "@/lib/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

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
