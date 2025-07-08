"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export const currencies: Currency[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
];

// Mock conversion rates from USD
export const conversionRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.93,
  GEL: 2.85,
};


interface CurrencyContextType {
  currency: Currency;
  setCurrency: (code: string) => void;
  currencies: Currency[];
  formatCurrency: (priceInUsd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currencyCode, setCurrencyCode] = useState<string>('USD');

  useEffect(() => {
    const storedCurrency = localStorage.getItem('daytourguides-currency');
    if (storedCurrency && currencies.some(c => c.code === storedCurrency)) {
      setCurrencyCode(storedCurrency);
    }
  }, []);

  const setCurrency = (code: string) => {
    if (currencies.some(c => c.code === code)) {
      setCurrencyCode(code);
      localStorage.setItem('daytourguides-currency', code);
    }
  };

  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];

  const format = (priceInUsd: number) => {
      const rate = conversionRates[currency.code] || 1;
      const convertedPrice = priceInUsd * rate;
      
      return `${currency.symbol}${convertedPrice.toFixed(2)}`;
  };


  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies, formatCurrency: format }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
