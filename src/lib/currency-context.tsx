"use client";

import { createContext, useContext } from "react";

type CurrencyContextType = {
  tasa: number | null;
};

const CurrencyContext = createContext<CurrencyContextType>({ tasa: null });

export function CurrencyProvider({
  children,
  tasa,
}: {
  children: React.ReactNode;
  tasa: number | null;
}) {
  return (
    <CurrencyContext.Provider value={{ tasa }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useTasa() {
  return useContext(CurrencyContext).tasa;
}
