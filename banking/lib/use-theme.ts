"use client";

import { useEffect, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark";

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

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("novabank-theme-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("novabank-theme-change", onStoreChange);
  };
}

function getServerSnapshot(): ThemeMode {
  return "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getPreferredTheme, getServerSnapshot);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";

    window.localStorage.setItem(storageKey, nextTheme);
    window.dispatchEvent(new Event("novabank-theme-change"));
  };

  return { theme, toggleTheme };
}
