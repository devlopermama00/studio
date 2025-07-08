
"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface HslColorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const HslColorInput = React.forwardRef<HTMLInputElement, HslColorInputProps>(
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

    const isValidHsl = (hslStr: string) => {
        if (typeof hslStr !== 'string') return false;
        const hslRegex = /^(\d{1,3})\s+([0-9]{1,3})%\s+([0-9]{1,3})%$/;
        return hslRegex.test(hslStr.trim());
    };

    return (
      <div className="relative">
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md border"
          style={{
            backgroundColor: isValidHsl(color) ? `hsl(${color})` : "#cccccc"
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
HslColorInput.displayName = 'HslColorInput';
