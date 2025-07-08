
"use client";

import { CurrencyProvider } from "@/context/currency-context";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode, createContext, useContext } from "react";

// Settings Context
interface Settings {
  [key: string]: any;
}
const SettingsContext = createContext<Settings | null>(null);

export const useSettings = (): Settings => {
  const context = useContext(SettingsContext);
  if (context === null) {
      // Provide a default empty object or handle the null case appropriately
      // for components that might render on both server and client initially.
      return {}; 
  }
  return context;
};

export function Providers({ children, settings }: { children: ReactNode, settings: Settings }) {
    return (
        <SettingsContext.Provider value={settings}>
            <CurrencyProvider>
                {children}
                <Toaster />
            </CurrencyProvider>
        </SettingsContext.Provider>
    );
}
