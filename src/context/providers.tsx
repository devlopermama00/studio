"use client";

import { CurrencyProvider } from "@/context/currency-context";
import { SettingsProvider } from "@/context/settings-context";
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from "react";

interface Settings {
  [key: string]: any;
}

export function Providers({ children, settings }: { children: ReactNode, settings: Settings }) {
    return (
        <SettingsProvider settings={settings}>
            <CurrencyProvider>
                {children}
                <Toaster />
            </CurrencyProvider>
        </SettingsProvider>
    );
}
