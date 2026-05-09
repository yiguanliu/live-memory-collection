# Live Memory Collection

An interactive photo-collection canvas. Cards drag with inertia, snap to a dot/grid pattern, minimize into a dot, expand to fullscreen, and carousel through photos. Built from a Figma design.

## Highlights

- **Drag with momentum** — `framer-motion` `dragMomentum` + custom `dragTransition`, with elevated shadow on grab and `cursor-grabbing` feedback.
- **Snap to grid** — drag inertia targets the nearest dot/grid step (`dragTransition.modifyTarget`). Toggleable in settings.
- **Resize** — bottom-right corner pointer-tracker, clamped to 140×160 → 520×640.
- **Three card states** with `layoutId` morphing:
  - *Normal* — full card with photo, controls, action row
  - *Minimized* — 28px circular dot keyed off the photo
  - *Fullscreen* — viewport-size view with photo carousel and two-stage delete confirm
- **Progressive blur** — clear top third, blur ramps up, fully blurred bottom. Implemented as a clear base layer + a blurred copy under a vertical mask gradient.
- **macOS-style window controls** — yellow minimize, green maximize. Icons reveal on hover.
- **Background patterns** — Dots / Grid / Off, with a density slider (12–80px). Generated as CSS gradients; no SVG asset needed.
- **shadcn-style primitives** — Dialog, Popover, Slider, Tooltip, Button, Input, Label all built locally on Radix + CVA.
- **Local file ingest** — multi-photo picker for both new collections and adding to existing ones, with thumbnail preview and per-item remove.

## Stack

- React 18 · TypeScript · Vite 6
- Tailwind CSS v3
- framer-motion v11 (drag, layout, AnimatePresence)
- Radix primitives (`@radix-ui/react-dialog`, `popover`, `slider`, `tooltip`, `slot`)
- lucide-react icons
- `class-variance-authority` + `clsx` + `tailwind-merge` for variant-driven components

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
```

## Deploy (Vercel)

The project ships with a `vercel.json` configured for Vite — Vercel auto-detects everything.

**Option 1 — GitHub integration (recommended):**

1. Sign in at [vercel.com](https://vercel.com) and import the GitHub repo.
2. Vercel detects Vite and uses `npm run build` → `dist/`. No env vars needed.
3. Every push to `main` deploys to production; every PR gets a preview URL.

**Option 2 — Vercel CLI:**

```bash
npm i -g vercel        # one-time install
vercel login           # interactive
vercel                 # preview deploy from current branch
vercel --prod          # production deploy
```

The `vercel.json` includes an SPA rewrite (forwarding non-asset paths to `index.html`) and long-lived cache headers for hashed `/assets/*` files.

## Project layout

```
src/
  App.tsx                       # Top-level state + canvas
  data.ts                       # Seed collections
  types.ts                      # Collection / Settings / CardState
  lib/
    pattern.ts                  # CSS pattern background + snapTo()
    utils.ts                    # cn(), uid()
  components/
    MemoryCard.tsx              # Draggable card (normal | minimized)
    FullscreenView.tsx          # Fullscreen layer + delete confirm
    BlurPhoto.tsx               # Two-layer progressive blur
    PhotoFallback.tsx           # Warm gradient when no photo
    WindowControls.tsx          # Traffic-light minimize/maximize
    SettingsPanel.tsx           # Pattern + density + snap controls
    CreateCollectionDialog.tsx  # New-collection form
    AddPhotosDialog.tsx         # Append photos to existing card
    ui/                         # shadcn-style Radix primitives
public/photos/                  # Seed photos (Jamie, Anthony, Hazel, Layla)
static-design/                  # Original static HTML port from Figma
```

## Notes

- **Eliza's seed card** has no photo — the Figma MCP exported a blank PNG for that node. The card uses a CSS warm-gradient fallback (`PhotoFallback`) which keeps the visual mood without claiming a face that isn't there.
- **z-index** — focus-on-click renormalizes ranks to `1..N` per render so cards never grow past the dialog (z-200) or fullscreen (z-100) layers.
- **Settings persistence** — currently in-memory only. localStorage wiring is a one-line add to `App.tsx` if needed.

## Source design

Figma file: [`Home OS / UI` — node `56:587`](https://www.figma.com/design/UEIpUsNnTuJIR1X7hL6GvY/Home-OS---UI?node-id=56-587).

The early static-HTML implementation is preserved under [`static-design/`](static-design/) for reference.
