
"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface ColorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const HslColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ value: controlledValue, onChange, ...props }, ref) => {
    const [color, setColor] = useState(String(controlledValue || ""));

    useEffect(() => {
        setColor(String(controlledValue || ""));
    }, [controlledValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
        if (onChange) {
            onChange(e);
        }
    };
    
    const toCssColor = (colorStr: string): string => {
        if (typeof colorStr !== 'string') return "#cccccc";
        const trimmed = colorStr.trim();
        
        // Check for HEX format
        if (trimmed.startsWith('#')) {
             const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
             return hexRegex.test(trimmed) ? trimmed : "#cccccc";
        }
        
        // Check for HSL format
        const hslRegex = /^(\d{1,3})\s+([0-9]{1,3})%\s+([0-9]{1,3})%$/;
        return hslRegex.test(trimmed) ? `hsl(${trimmed})` : "#cccccc";
    }

    return (
      <div className="relative">
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md border"
          style={{
            backgroundColor: toCssColor(color)
          }}
        />
        <Input
          ref={ref}
          value={color}
          onChange={handleInputChange}
          className={cn("pl-10", props.className)}
          {...props}
        />
      </div>
    );
  }
);
HslColorInput.displayName = 'ColorInput';
