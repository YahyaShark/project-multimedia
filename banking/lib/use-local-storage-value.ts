"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useLocalStorageValue(key: string, fallbackValue: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    return window.localStorage.getItem(key) || fallbackValue;
  }, [fallbackValue, key]);

  const getServerSnapshot = useCallback(() => fallbackValue, [fallbackValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
