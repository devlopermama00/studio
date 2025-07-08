"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface ColorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const toCssColor = (colorStr: string): string => {
    if (typeof colorStr !== 'string' || !colorStr.trim()) {
        return "transparent";
    }
    const trimmed = colorStr.trim().toLowerCase();

    // Check for standard CSS color function formats
    if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(') || trimmed.startsWith('hsl(') || trimmed.startsWith('hsla(') || trimmed.startsWith('#')) {
        // This is a basic check. The browser will handle invalid values gracefully for the preview.
        // We're assuming the input is a valid CSS color string for preview purposes.
        return trimmed;
    }
    
    // Check for the space-separated HSL format from shadcn theme (e.g., "204 75% 50%")
    const shadcnHslRegex = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;
    if (shadcnHslRegex.test(trimmed)) {
        return `hsl(${trimmed})`;
    }

    // If no format matches, it's not a color we can display
    return "transparent";
};


export const HslColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ value: controlledValue, onChange, ...props }, ref) => {
    // The component's own state for the input field text
    const [inputValue, setInputValue] = useState(String(controlledValue || ""));

    // Sync from parent (react-hook-form) to component state when the form is reset or initialized
    useEffect(() => {
        if (controlledValue !== inputValue) {
            setInputValue(String(controlledValue || ""));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlledValue]);

    // Handle user typing in the input field
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue); // Update local state immediately for a responsive UI
        if (onChange) {
            onChange(e); // Propagate the change event up to react-hook-form
        }
    };
    
    const displayColor = toCssColor(inputValue);

    return (
      <div className="relative">
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md border"
          style={{
            backgroundColor: displayColor
          }}
        />
        <Input
          ref={ref}
          value={inputValue}
          onChange={handleInputChange}
          className={cn("pl-10", props.className)}
          {...props}
        />
      </div>
    );
  }
);
HslColorInput.displayName = 'HslColorInput';