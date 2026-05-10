export type CardState = "normal" | "minimized" | "fullscreen";

export type PatternType = "dot" | "grid" | "none";

export type ThemeName = "sunset" | "mist" | "sage" | "plum";

export type DotSize = "sm" | "md" | "lg";

export const DOT_SIZE_PX: Record<DotSize, number> = {
  sm: 20,
  md: 28,
  lg: 40,
};

export type ThemePalette = {
  /** Inner radial gradient stop near the top-left */
  from: string;
  /** Mid stop */
  via: string;
  /** Outer stop / fallback solid bg */
  to: string;
  /** Stroke color used for the wave + grid lines */
  line: string;
  /** Space-separated RGB triplet (e.g. "180 104 43") for the photo
   *  overlay tint at the bottom-left of cards. */
  overlayRgb: string;
};

export const THEMES: Record<ThemeName, ThemePalette> = {
  sunset: {
    from: "#e2a87a",
    via: "#d7baa2",
    to: "#cccbc9",
    line: "rgba(255,255,255,0.55)",
    overlayRgb: "180 104 43",
  },
  mist: {
    from: "#a3b8d8",
    via: "#c8d3e6",
    to: "#dfe3eb",
    line: "rgba(255,255,255,0.55)",
    overlayRgb: "92 110 158",
  },
  sage: {
    from: "#92b39a",
    via: "#bcccbb",
    to: "#dde2d8",
    line: "rgba(255,255,255,0.55)",
    overlayRgb: "70 120 90",
  },
  plum: {
    from: "#9c7aa8",
    via: "#c2adcc",
    to: "#dad3df",
    line: "rgba(255,255,255,0.55)",
    overlayRgb: "120 78 138",
  },
};

export type Settings = {
  pattern: PatternType;
  density: number; // px between pattern points; also the snap step
  snap: boolean;
  showWaves: boolean;
  theme: ThemeName;
  dotSize: DotSize;
  /** Photo overlay tint opacity, 0 (none) → 1 (fully opaque). */
  overlayOpacity: number;
};

export type Collection = {
  id: string;
  name: string;
  date: string;
  label?: string;
  photos: string[];
  position: { x: number; y: number };
  size: { w: number; h: number };
  state: CardState;
  photoIndex: number;
  /** Layer order — higher comes to front. */
  z: number;
};

export const DEFAULT_SETTINGS: Settings = {
  pattern: "dot",
  density: 32,
  snap: true,
  showWaves: true,
  theme: "sunset",
  dotSize: "md",
  overlayOpacity: 0.25,
};
