import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import { MemoryCard } from "@/components/MemoryCard";
import { FullscreenView } from "@/components/FullscreenView";
import {
  CreateCollectionPopover,
  type NewCollectionInput,
} from "@/components/CreateCollectionPopover";
import { AddPhotosDialog } from "@/components/AddPhotosDialog";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SortPanel } from "@/components/SortPanel";
import { ThemePanel } from "@/components/ThemePanel";
import { IntroOverlay } from "@/components/IntroOverlay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { initialCollections } from "@/data";
import {
  DEFAULT_SETTINGS,
  DOT_SIZE_PX,
  type Collection,
  type Settings,
} from "@/types";
import { patternBackground } from "@/lib/pattern";
import { computeSortedPositions, type SortMode } from "@/lib/layout";
import { uid } from "@/lib/utils";

type IntroPhase = "wave" | "dots" | "expand" | "done";

export default function App() {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [intro, setIntro] = useState<IntroPhase>("wave");
  const canvasRef = useRef<HTMLDivElement>(null);

  // Onboarding sequence on first load:
  //   wave (0–0.9s)  — only sin-wave background
  //   dots (0.9–1.8s) — cards fade in as small circles
  //   expand (1.8s+) — circles morph into full cards, wave fades out
  //   done           — interactive
  useEffect(() => {
    const timers = [
      setTimeout(() => setIntro("dots"), 900),
      setTimeout(() => setIntro("expand"), 1800),
      setTimeout(() => setIntro("done"), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const minimizeAll = () =>
    setCollections((prev) =>
      prev.map((c) =>
        c.state === "fullscreen" ? c : { ...c, state: "minimized" }
      )
    );
  const restoreAll = () =>
    setCollections((prev) =>
      prev.map((c) =>
        c.state === "fullscreen" ? c : { ...c, state: "normal" }
      )
    );
  const deleteCollection = (id: string) =>
    setCollections((prev) => prev.filter((c) => c.id !== id));

  const handleCreateCollection = (input: NewCollectionInput) => {
    const el = canvasRef.current;
    const w = el?.clientWidth ?? 1024;
    const h = el?.clientHeight ?? 768;
    setCollections((prev) => {
      const maxZ = prev.reduce((m, c) => Math.max(m, c.z), 0);
      const collection: Collection = {
        id: uid(),
        name: input.name,
        date: input.date,
        label: input.label,
        photos: input.photos,
        position: {
          x: w / 2 - 110 + Math.random() * 40,
          y: h / 2 - 140 + Math.random() * 40,
        },
        size: { w: 220, h: 280 },
        state: "normal",
        photoIndex: 0,
        z: maxZ + 1,
      };
      return [...prev, collection];
    });
  };

  const sortCards = (mode: SortMode) => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dotPx = DOT_SIZE_PX[settings.dotSize];
    setCollections((prev) => {
      const positions = computeSortedPositions(
        prev,
        mode,
        r.width,
        r.height,
        dotPx
      );
      return prev.map((c) => {
        const p = positions.get(c.id);
        return p ? { ...c, position: p } : c;
      });
    });
  };

  const updateCollection = (id: string, patch: Partial<Collection>) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const focusCollection = (id: string) => {
    setCollections((prev) => {
      // Already on top? skip — avoids re-renders on every click.
      const maxZ = prev.reduce((m, c) => Math.max(m, c.z), 0);
      const target = prev.find((c) => c.id === id);
      if (target && target.z === maxZ) return prev;

      // Renormalize ranks to 1..N to keep z-indexes bounded and well below
      // overlay layers (dialog z-[200], fullscreen z-[100]).
      const sorted = [...prev].sort((a, b) => a.z - b.z);
      const ranked = new Map(
        sorted.map((c, i) => [c.id, c.id === id ? sorted.length + 1 : i + 1])
      );
      return prev.map((c) => ({ ...c, z: ranked.get(c.id)! }));
    });
  };

  const addingCollection = collections.find((c) => c.id === addingTo);

  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={120}>
    <div
      className="relative h-full w-full overflow-hidden"
      style={patternBackground(settings)}
    >
      {/* Crosshair + circle reference (subtle) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
        <div className="absolute left-1/2 top-[60%] h-[1100px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      </div>

      {/* Top header */}
      <div className="absolute inset-x-0 top-6 z-30 flex items-center justify-center">
        <p className="text-stone-50/90 text-[20px] font-medium tracking-wide">
          add your photo to collection now
        </p>
      </div>

      {/* Left rail: vertically centered toolbar with even spacing. */}
      <div className="absolute left-6 top-1/2 z-40 flex -translate-y-1/2 flex-col items-start gap-2">
        <SettingsPanel settings={settings} onChange={setSettings} />
        <SortPanel onSort={sortCards} />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={minimizeAll}
              aria-label="Minimize all"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Minimize all</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={restoreAll}
              aria-label="Restore all"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Restore all</TooltipContent>
        </Tooltip>
        <ThemePanel settings={settings} onChange={setSettings} />
      </div>

      {/* Right rail: vertically centered, mirrors the left rail. Holds the
          New-collection trigger (which opens an anchored popover form). */}
      <div className="absolute right-6 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-2">
        <CreateCollectionPopover onCreate={handleCreateCollection} />
      </div>

      {/* Bottom title */}
      <div className="pointer-events-none absolute inset-x-0 bottom-12 z-0 text-center">
        <h1 className="font-host text-[64px] font-normal leading-[1.05] text-stone-200/95">
          LIVE MEMORY
          <br />
          COLLECTION
        </h1>
      </div>

      {/* Sin-wave overlay — fades in during the intro and stays as ambient
          motion afterwards. Toggleable from settings. */}
      <IntroOverlay visible={settings.showWaves} />

      {/* Card canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: intro === "wave" ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <AnimatePresence>
            {collections.map((c) => {
              const introMinimize =
                (intro === "wave" || intro === "dots") &&
                c.state === "normal";
              const display: Collection = introMinimize
                ? { ...c, state: "minimized" }
                : c;
              return (
                <MemoryCard
                  key={c.id}
                  collection={display}
                  canvasRef={canvasRef}
                  settings={settings}
                  onChange={(patch) => updateCollection(c.id, patch)}
                  onFocus={() => focusCollection(c.id)}
                  onAddPhotos={() => setAddingTo(c.id)}
                  onDelete={() => deleteCollection(c.id)}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Fullscreen layer */}
      <AnimatePresence>
        {collections
          .filter((c) => c.state === "fullscreen")
          .map((c) => (
            <FullscreenView
              key={c.id}
              collection={c}
              onBack={() => updateCollection(c.id, { state: "normal" })}
              onPrev={() =>
                updateCollection(c.id, {
                  photoIndex:
                    c.photos.length > 0
                      ? (c.photoIndex - 1 + c.photos.length) % c.photos.length
                      : 0,
                })
              }
              onNext={() =>
                updateCollection(c.id, {
                  photoIndex:
                    c.photos.length > 0
                      ? (c.photoIndex + 1) % c.photos.length
                      : 0,
                })
              }
              onDeleteCurrent={() => {
                if (c.photos.length === 0) return;
                const nextPhotos = c.photos.filter(
                  (_, i) => i !== c.photoIndex
                );
                const nextIndex = Math.min(
                  c.photoIndex,
                  Math.max(0, nextPhotos.length - 1)
                );
                updateCollection(c.id, {
                  photos: nextPhotos,
                  photoIndex: nextIndex,
                });
              }}
            />
          ))}
      </AnimatePresence>

      <AddPhotosDialog
        open={addingTo !== null}
        onOpenChange={(o) => !o && setAddingTo(null)}
        collectionName={addingCollection?.name ?? ""}
        onAdd={(urls) => {
          if (!addingTo) return;
          updateCollection(addingTo, {
            photos: [...(addingCollection?.photos ?? []), ...urls],
          });
        }}
      />
    </div>
    </TooltipProvider>
  );
}
