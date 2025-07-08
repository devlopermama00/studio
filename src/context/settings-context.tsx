"use client";

import { createContext, useContext, type ReactNode } from "react";

// Settings Context
interface Settings {
  [key: string]: any;
}

const SettingsContext = createContext<Settings>({});

export const useSettings = (): Settings => {
  return useContext(SettingsContext);
};

export function SettingsProvider({ children, settings }: { children: ReactNode, settings: Settings }) {
    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
}
