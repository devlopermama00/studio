import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { colord, extend } from "colord";
import hslPlugin from "colord/plugins/hsl";

extend([hslPlugin]);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/ & /g, '-and-') // Replace & with 'and'
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
}

export function toHslString(color: string): string | null {
  if (!color) return null;
  try {
    const c = colord(color);
    if (!c.isValid()) return null;
    const hsl = c.toHsl();
    // Return in the format "H S% L%" for CSS variables
    return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
  } catch (e) {
    console.error("Could not convert color to HSL string:", e);
    return null;
  }
}
