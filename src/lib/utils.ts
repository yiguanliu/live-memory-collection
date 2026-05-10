import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Convert a hex string ("#e2a87a") to a space-separated RGB triplet
 *  ("226 168 122") suitable for use inside `rgb(var(--name) / alpha)`. */
export function hexToRgb(hex: string): string {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length < 3) return "0 0 0";
  return m
    .slice(0, 3)
    .map((x) => parseInt(x, 16))
    .join(" ");
}
