"use client";

import React, { useEffect, useRef } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const toValidCssColor = (colorStr: string): string => {
    if (typeof colorStr !== 'string' || !colorStr.trim()) {
        return "transparent";
    }
    const trimmed = colorStr.trim();
    const shadcnHslRegex = /^\d{1,3}(\.\d+)?\s+\d{1,3}(\.\d+)?%\s+\d{1,3}(\.\d+)?%$/;
    if (shadcnHslRegex.test(trimmed)) {
        return `hsl(${trimmed})`;
    }
    const s = new Option().style;
    s.color = trimmed;
    return s.color ? trimmed : "transparent";
};

const toHex = (colorStr: string): string => {
    if (typeof window === 'undefined') return '#000000';
    const validCssColor = toValidCssColor(colorStr);
    if (validCssColor === 'transparent') {
        return '#000000';
    }
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return '#000000';
    ctx.fillStyle = validCssColor;
    return ctx.fillStyle;
};

export const HslColorInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const colorPickerRef = useRef<HTMLInputElement>(null);
    const [hexValue, setHexValue] = React.useState("#000000");

    useEffect(() => {
        setHexValue(toHex(String(value || '')));
    }, [value]);

    return (
      <div className="relative">
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md border cursor-pointer"
          style={{ backgroundColor: toValidCssColor(String(value || '')) }}
          onClick={() => colorPickerRef.current?.click()}
        />
        
        <Input
          ref={ref}
          value={value || ""}
          onChange={onChange}
          className={cn("pl-10", className)}
          {...props}
        />
        
        <input
            type="color"
            ref={colorPickerRef}
            value={hexValue}
            onChange={onChange}
            className="absolute -z-10 w-0 h-0 opacity-0"
            tabIndex={-1}
        />
      </div>
    );
  }
);
HslColorInput.displayName = 'HslColorInput';
