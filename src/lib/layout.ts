import type { Collection } from "@/types";

export type SortMode = "size" | "grid" | "circular";

const TOP_RESERVE = 80; // header + button strip
const BOTTOM_RESERVE = 200; // big "LIVE MEMORY COLLECTION" type

/**
 * Pure layout helpers: given the current collections + canvas size,
 * compute a new (x, y) for each card. Doesn't mutate.
 */
export function computeSortedPositions(
  collections: Collection[],
  mode: SortMode,
  canvasW: number,
  canvasH: number,
  dotPx: number
): Map<string, { x: number; y: number }> {
  switch (mode) {
    case "size":
      return packBySize(collections, canvasW, canvasH, dotPx);
    case "grid":
      return arrangeGrid(collections, canvasW, canvasH, dotPx);
    case "circular":
      return arrangeCircular(collections, canvasW, canvasH, dotPx);
  }
}

/** Largest first, packed left → right, wrapping rows. */
function packBySize(collections: Collection[], w: number, h: number, dotPx: number) {
  const sorted = [...collections].sort(
    (a, b) => b.size.w * b.size.h - a.size.w * a.size.h
  );
  const positions = new Map<string, { x: number; y: number }>();
  const margin = 40;
  const gap = 24;

  let x = margin;
  let y = margin + 20;
  let rowH = 0;

  for (const c of sorted) {
    const w_ = c.state === "minimized" ? dotPx : c.size.w;
    const h_ = c.state === "minimized" ? dotPx : c.size.h;
    if (x + w_ > w - margin) {
      x = margin;
      y += rowH + gap;
      rowH = 0;
    }
    positions.set(c.id, { x, y });
    x += w_ + gap;
    rowH = Math.max(rowH, h_);
  }
  void h;
  return positions;
}

/** Centered grid; each card sits in its own cell. */
function arrangeGrid(collections: Collection[], w: number, h: number, dotPx: number) {
  const n = collections.length;
  if (n === 0) return new Map();

  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);

  const usableW = w - 80;
  const usableH = Math.max(300, h - TOP_RESERVE - BOTTOM_RESERVE);
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  const offsetX = 40;
  const offsetY = TOP_RESERVE;

  const positions = new Map<string, { x: number; y: number }>();
  collections.forEach((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cardW = c.state === "minimized" ? dotPx : c.size.w;
    const cardH = c.state === "minimized" ? dotPx : c.size.h;
    positions.set(c.id, {
      x: offsetX + col * cellW + (cellW - cardW) / 2,
      y: offsetY + row * cellH + (cellH - cardH) / 2,
    });
  });
  return positions;
}

/** Even angular distribution around the canvas center. */
function arrangeCircular(collections: Collection[], w: number, h: number, dotPx: number) {
  const n = collections.length;
  if (n === 0) return new Map();

  const cx = w / 2;
  const cy = h / 2 - 30;
  const radius = Math.min(w, h - TOP_RESERVE - BOTTOM_RESERVE) * 0.32;

  const positions = new Map<string, { x: number; y: number }>();
  collections.forEach((c, i) => {
    // Start from the top (angle = -π/2) and go clockwise.
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const cardW = c.state === "minimized" ? dotPx : c.size.w;
    const cardH = c.state === "minimized" ? dotPx : c.size.h;
    positions.set(c.id, {
      x: cx + radius * Math.cos(angle) - cardW / 2,
      y: cy + radius * Math.sin(angle) - cardH / 2,
    });
  });
  return positions;
}
