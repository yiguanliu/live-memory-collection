# Amber Memory

[![License: MIT](https://img.shields.io/badge/license-MIT-e2a87a.svg)](LICENSE)
[![Version 1.0](https://img.shields.io/badge/version-1.0-9c7aa8.svg)](https://github.com/yiguanliu/live-memory-collection/releases)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)](https://vitejs.dev/)

> **From fragmented contacts to living relationship memory.**

Amber Memory is designed around the idea that relationships are not static entries in a contact list, but evolving emotional timelines. The platform helps users preserve continuity with the people who matter most through memory surfaces, contextual interactions, and AI-assisted communication. Instead of optimizing productivity, Amber focuses on warmth, presence, and meaningful reconnection.

The system organizes conversations, shared moments, milestones, and emotional context into a fluid relationship layer that feels personal rather than transactional. AI assists quietly in the background — helping users remember, reconnect, and maintain closeness without removing authenticity from human interaction.

## Designing emotionally-aware interaction systems

The product explores how interface design can support emotional continuity in modern life. Every interaction is designed to feel soft, ambient, and human-centered — from floating relationship cards and memory surfaces to subtle motion behaviors and layered visual hierarchy. The interface avoids productivity aesthetics and instead emphasizes calmness, intimacy, and emotional presence.

Built as an AI-native mobile experience, Amber Memory combines adaptive interaction design, contextual intelligence, and behavioral UX into a system that supports long-term human relationships rather than short-term engagement.

## Interaction highlights

- **Living memory canvas** — each person sits as a draggable card on a warm gradient surface that hums with subtle flowing sin-wave lines.
- **Three card states** with seamless scale-fade between them:
  - *Full card* — photo, name, date, action chrome (hidden until hover).
  - *Minimized dot* — small circle keyed off the photo; double-tap to restore so a stray drag never reopens the card.
  - *Fullscreen* — viewport-size view with photo carousel slide animation and two-stage delete confirm.
- **Four moods** — *Sunset*, *Mist*, *Sage*, *Plum*. Each theme repaints the entire surface in one gesture: canvas gradient, card-frame ring, photo overlay tint, sliders, toggles, primary buttons, hover outlines.
- **Cursor-reactive highlights** — the white highlight on each card's edge shifts away from your pointer, lighting the surface like a soft reflection from the opposite side.
- **Drag with inertia** — `framer-motion` momentum + customizable snap-to-grid step; cards rest naturally on the canvas pattern. Lift-on-press visual: scale up slightly with a stronger drop shadow, like the card is picked up by the cursor.
- **Progressive blur on photos** — top third stays sharp for face recognition, bottom fades into the warm overlay so captions and chrome read cleanly.
- **Hover-fade chrome** — window controls, drag handle, and bottom action row only surface when you reach for them; at rest the photo leads.
- **macOS-style window controls** — red close, yellow minimize, green zoom in canonical order. Red close uses a two-stage confirm pill so an accidental click never destroys a memory.
- **Glass popovers** — Settings, Sort, and New-collection panels use 50% white + heavy backdrop blur so the canvas reads through. All themed accent colors live on `:root` so portal-rendered overlays inherit them.
- **Sort & arrange** — flow by size, snap into a grid, or distribute in a circle. Cards spring smoothly into their new positions.
- **Onboarding intro** — first load plays a 4-phase sequence: ambient wave → dots appear → dots morph into cards → wave settles. The wave then stays as ambient motion.
- **Viewport-aware** — cards clamp into the viewport on resize so nothing slips off-screen.

## Built with

React 18 · TypeScript · Vite 6 · Tailwind CSS · framer-motion 11 · Radix primitives (Dialog, Popover, Slider, Tooltip) · lucide-react · class-variance-authority · clsx · tailwind-merge

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
```

## Deploy (Vercel)

The project ships with a `vercel.json` configured for Vite — Vercel auto-detects everything.

**GitHub integration (recommended):**

1. Sign in at [vercel.com](https://vercel.com) and import the GitHub repo.
2. Vercel detects Vite and runs `npm run build` → `dist/`. No env vars needed.
3. Every push to `main` deploys to production; every PR gets a preview URL.

**Vercel CLI:**

```bash
npm i -g vercel        # one-time install
vercel login           # interactive
vercel                 # preview deploy
vercel --prod          # production deploy
```

The `vercel.json` includes an SPA rewrite (non-asset paths → `index.html`) and long-lived immutable cache headers on hashed `/assets/*` files.

## Project layout

```
src/
  App.tsx                         # Top-level state, canvas, theme CSS vars
  data.ts                         # Seed collections
  types.ts                        # Collection, Settings, ThemePalette, DOT_SIZE_PX
  lib/
    pattern.ts                    # CSS pattern background (themed), snapTo()
    layout.ts                     # computeSortedPositions (size / grid / circle)
    utils.ts                      # cn(), uid(), hexToRgb()
  components/
    MemoryCard.tsx                # Draggable card; normal & dot states; cursor-reactive highlight
    FullscreenView.tsx            # Fullscreen layer; photo slide carousel; delete confirm
    BlurPhoto.tsx                 # Progressive top-to-bottom blur
    PhotoFallback.tsx             # Warm gradient placeholder
    WindowControls.tsx            # macOS traffic lights (red / yellow / green)
    SettingsPanel.tsx             # Pattern, density, snap, waves, overlay opacity
    SortPanel.tsx                 # Size / grid / circular arrangements
    ThemePanel.tsx                # 4 color schemes + dot size selector
    CreateCollectionPopover.tsx   # Anchored form for new collections
    AddPhotosDialog.tsx           # Append photos to existing card
    IntroOverlay.tsx              # Sin-wave ambient background motion
    ui/                           # shadcn-style Radix primitives
public/photos/                    # Seed photos (Jamie, Anthony, Hazel, Layla)
static-design/                    # Original static HTML port from Figma
```

## Notes

- **Theme accent on `:root`** — `--accent`, `--accent-rgb`, `--accent-deep-rgb`, `--overlay-rgb`, `--overlay-opacity` are set on `document.documentElement`. Radix popovers/tooltips render in a portal at `body`, so vars must be at root for them to inherit.
- **z-index ordering** — focus-on-click renormalizes per-card ranks to `1..N` each render so cards never overtake the dialog (`z-200`) or fullscreen (`z-100`) layers.
- **Mobile-friendly gestures** — drag, double-tap to restore a dot, two-stage delete; nothing requires hover.
- **Settings persistence** — currently in-memory only.

## Source design

Visual exploration started in Figma: [`Home OS / UI` — node `56:587`](https://www.figma.com/design/UEIpUsNnTuJIR1X7hL6GvY/Home-OS---UI?node-id=56-587). The early static-HTML port lives in [`static-design/`](static-design/) for reference.

## License

MIT — see [LICENSE](LICENSE).
