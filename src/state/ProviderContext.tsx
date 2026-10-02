import React, { createContext, useContext, ReactNode } from 'react';
import { DataProvider } from '../providers/DataProvider';
import { createProvider } from '../providers';

const ProviderContext = createContext<DataProvider | null>(null);

const defaultProvider = createProvider();

export function DataProviderWrapper({ children, provider = defaultProvider }: { children: ReactNode, provider?: DataProvider }) {
  return (
    <ProviderContext.Provider value={provider}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider(): DataProvider {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error('useProvider must be used within DataProviderWrapper');
  return ctx;
}
