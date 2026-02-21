import { useEffect, useState, useCallback } from 'react';
import { persistence } from '@/lib/persistence';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const pValue = persistence.getSync(key as any);
      if (pValue !== undefined && pValue !== null) return pValue as T;

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        persistence.set(key as any, valueToStore);


        window.dispatchEvent(
          new CustomEvent('caplay-local-storage', { detail: { key, value: valueToStore } })
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        const next = e.newValue != null ? JSON.parse(e.newValue) : initialValue;
        setStoredValue(next as T);
      } catch {
        setStoredValue(initialValue);
      }
    };

    const onCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ key: string; value: T }>;
        if (ce.detail?.key !== key) return;
        setStoredValue(ce.detail.value);
      } catch { }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      window.addEventListener('caplay-local-storage', onCustom as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('caplay-local-storage', onCustom as EventListener);
      }
    };
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}
