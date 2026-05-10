import { THEMES, type Settings } from "@/types";

/**
 * Build the CSS background for the canvas given current settings,
 * honoring the active theme palette.
 */
export function patternBackground(settings: Settings): React.CSSProperties {
  const palette = THEMES[settings.theme];
  const base = `radial-gradient(
    ellipse 1100px 1300px at 18% 12%,
    ${palette.from} 0%,
    ${palette.via} 45%,
    ${palette.to} 95%
  )`;
  const tint = "linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.04))";

  if (settings.pattern === "none") {
    return { background: `${tint}, ${base}`, backgroundColor: palette.to };
  }

  const size = `${settings.density}px ${settings.density}px`;
  if (settings.pattern === "dot") {
    const dot = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.55) 1px, transparent 1.6px)`;
    return {
      backgroundImage: `${dot}, ${tint}, ${base}`,
      backgroundSize: `${size}, auto, auto`,
      backgroundColor: palette.to,
    };
  }
  // grid
  const grid = `
    linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)
  `;
  return {
    backgroundImage: `${grid}, ${tint}, ${base}`,
    backgroundSize: `${size}, ${size}, auto, auto`,
    backgroundColor: palette.to,
  };
}

/** Snap a value to the nearest grid step. */
export function snapTo(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}
