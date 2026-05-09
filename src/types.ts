export type CardState = "normal" | "minimized" | "fullscreen";

export type PatternType = "dot" | "grid" | "none";

export type Settings = {
  pattern: PatternType;
  density: number; // px between pattern points; also the snap step
  snap: boolean;
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
};
