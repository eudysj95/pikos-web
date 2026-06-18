"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type CurrencyContextType = {
  tasa: number | null;
  refreshTasa: () => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextType>({ tasa: null, refreshTasa: async () => {} });

export function CurrencyProvider({
  children,
  tasa: initialTasa,
}: {
  children: React.ReactNode;
  tasa: number | null;
}) {
  const [tasa, setTasa] = useState<number | null>(initialTasa);

  const refreshTasa = useCallback(async () => {
    try {
      const res = await fetch("/api/tasa-cambio?actual=true");
      if (res.ok) {
        const data = await res.json();
        setTasa(data.tasa);
      }
    } catch {
      // ignore fetch errors, keep current tasa
    }
  }, []);

  useEffect(() => {
    refreshTasa();
  }, [refreshTasa]);

  return (
    <CurrencyContext.Provider value={{ tasa, refreshTasa }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useTasa() {
  return useContext(CurrencyContext).tasa;
}

export function useRefreshTasa() {
  return useContext(CurrencyContext).refreshTasa;
}
