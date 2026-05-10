import { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  type PanInfo,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Contrast,
  GripVertical,
  Plus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { snapTo } from "@/lib/pattern";
import type { Collection, Settings } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlurPhoto } from "./BlurPhoto";
import { WindowControls } from "./WindowControls";

type Props = {
  collection: Collection;
  canvasRef: React.RefObject<HTMLDivElement>;
  settings: Settings;
  margin?: number;
  onChange: (next: Partial<Collection>) => void;
  onFocus: () => void;
  onAddPhotos: () => void;
  onDelete: () => void;
};

const SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 34,
  mass: 0.5,
};
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};
const slideTransition = {
  x: { type: "spring" as const, stiffness: 320, damping: 32 },
  opacity: { duration: 0.18 },
};
const MIN_W = 140;
const MIN_H = 160;
const MAX_W = 520;
const MAX_H = 640;

export function MemoryCard({
  collection,
  canvasRef,
  settings,
  margin = 24,
  onChange,
  onFocus,
  onAddPhotos,
  onDelete,
}: Props) {
  const { state, photos, photoIndex, size, position, name, date, label } =
    collection;

  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  // Stable ref for onChange so the resize effect doesn't re-bind on every parent render.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Sync motion values with prop position. If they're already in sync
  // (e.g. just after a drag ends, or after the resize-clamp set them),
  // skip — otherwise animate so sort/arrange actions flow smoothly to
  // the new position.
  useEffect(() => {
    const cx = x.get();
    const cy = y.get();
    if (Math.abs(cx - position.x) > 0.5 || Math.abs(cy - position.y) > 0.5) {
      animate(x, position.x, { type: "spring", stiffness: 220, damping: 28 });
      animate(y, position.y, { type: "spring", stiffness: 220, damping: 28 });
    }
  }, [position.x, position.y, x, y]);

  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });

  // Compute drag bounds from canvas size and clamp the current position into
  // them. Runs synchronously after layout so initial paint already shows
  // any out-of-viewport seed positions clamped into view.
  useLayoutEffect(() => {
    const recompute = () => {
      const el = canvasRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = state === "minimized" ? 28 : size.w;
      const h = state === "minimized" ? 28 : size.h;

      const minX = margin;
      const minY = margin;
      const maxX = Math.max(margin, r.width - w - margin);
      const maxY = Math.max(margin, r.height - h - margin);

      setDragConstraints({ left: minX, top: minY, right: maxX, bottom: maxY });

      const cx = x.get();
      const cy = y.get();
      const nx = Math.min(Math.max(cx, minX), maxX);
      const ny = Math.min(Math.max(cy, minY), maxY);
      if (nx !== cx || ny !== cy) {
        x.set(nx);
        y.set(ny);
        onChangeRef.current({ position: { x: nx, y: ny } });
      }
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [canvasRef, margin, size.w, size.h, state, x, y]);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Double-tap detection for restoring a minimized dot. A single tap on
  // the dot does nothing — only a second tap within DOUBLE_TAP_MS
  // commits to restore. Drag still works because framer-motion cancels
  // tap when pointer movement crosses the drag threshold.
  const lastTapRef = useRef(0);
  const DOUBLE_TAP_MS = 320;
  const handleDotTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current <= DOUBLE_TAP_MS) {
      lastTapRef.current = 0;
      onChange({ state: "normal" });
    } else {
      lastTapRef.current = now;
    }
  };

  const handleDragStart = (_: unknown, _info: PanInfo) => {
    setIsDragging(true);
    lastTapRef.current = 0;
    onFocus();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    let nx = x.get();
    let ny = y.get();
    if (settings.snap && settings.pattern !== "none") {
      nx = snapTo(nx, settings.density);
      ny = snapTo(ny, settings.density);
      x.set(nx);
      y.set(ny);
    }
    onChange({ position: { x: nx, y: ny } });
  };

  if (state === "fullscreen") return null;

  const isMinimized = state === "minimized";
  const renderW = isMinimized ? 28 : size.w;
  const renderH = isMinimized ? 28 : size.h;
  const radius = isMinimized ? 999 : 23;
  const currentPhoto = photos[photoIndex];

  return (
    // No shape morphing: each state has its own motion.div with the correct
    // size + border-radius pinned in inline style. The two cross-fade with
    // scale via AnimatePresence — never a half-morphed oval in between.
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={isMinimized ? "dot" : "card"}
        drag={!isResizing}
        dragConstraints={dragConstraints}
        dragElastic={0.08}
        dragMomentum
        dragTransition={{
          power: 0.35,
          timeConstant: 220,
          bounceStiffness: 500,
          bounceDamping: 28,
          modifyTarget: (t) =>
            settings.snap && settings.pattern !== "none"
              ? snapTo(t, settings.density)
              : t,
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onPointerDown={onFocus}
        // Double-tap to restore. A single tap is a no-op so the dot can
        // be focused / pressed without expanding; the second tap within
        // ~320ms commits.
        onTap={isMinimized ? handleDotTap : undefined}
        style={{
          x,
          y,
          zIndex: collection.z,
          width: renderW,
          height: renderH,
          borderRadius: radius,
          // Anchor scale animations to the top-left corner instead of the
          // center, so the entry/exit appears to grow out from / shrink
          // back into the card's positioned origin (where x,y land).
          transformOrigin: "top left",
        }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          boxShadow: isDragging
            ? // dragging: card is "picked up" — strong shadow + bright halo
              "0 0 0 1px rgba(255,255,255,0.85), 0 0 38px rgba(255,255,255,0.38), 0 30px 60px -10px rgba(0,0,0,0.4), 0 14px 30px rgba(0,0,0,0.22)"
            : isMinimized
            ? "0 4px 10px rgba(0, 0, 0, 0.25)"
            : // resting: just a soft drop shadow, no outline
              "0 5px 15px 3px rgba(0, 0, 0, 0.10)",
        }}
        exit={{ scale: 0.4, opacity: 0 }}
        whileHover={
          isMinimized
            ? { scale: 1.12 }
            : {
                // hover: outline appears with a soft white glow
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.70), 0 0 28px rgba(255,255,255,0.28), 0 8px 22px 3px rgba(0,0,0,0.12)",
              }
        }
        whileTap={
          isMinimized
            ? { scale: 1.08 }
            : {
                // active: card lifts toward cursor — slight scale up + stronger
                // shadow for the "picked up" feel.
                scale: 1.04,
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.85), 0 0 38px rgba(255,255,255,0.38), 0 30px 60px -10px rgba(0,0,0,0.4), 0 14px 30px rgba(0,0,0,0.22)",
              }
        }
        transition={SPRING}
        className={cn(
          "group/card absolute overflow-hidden select-none touch-none peach-frame",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
      {isMinimized ? (
        <MinimizedDot collection={collection} />
      ) : (
        <NormalCard
          collection={collection}
          currentPhoto={currentPhoto}
          name={name}
          date={date}
          label={label}
          onMinimize={() => onChange({ state: "minimized" })}
          onFullscreen={() => onChange({ state: "fullscreen" })}
          onAddPhotos={onAddPhotos}
          onDelete={onDelete}
          onResizeStart={() => setIsResizing(true)}
          onResizeEnd={() => setIsResizing(false)}
          onResize={(dw, dh) => {
            const nw = Math.max(MIN_W, Math.min(MAX_W, size.w + dw));
            const nh = Math.max(MIN_H, Math.min(MAX_H, size.h + dh));
            onChange({ size: { w: nw, h: nh } });
          }}
          onPrev={() =>
            onChange({
              photoIndex:
                photos.length > 0
                  ? (photoIndex - 1 + photos.length) % photos.length
                  : 0,
            })
          }
          onNext={() =>
            onChange({
              photoIndex:
                photos.length > 0 ? (photoIndex + 1) % photos.length : 0,
            })
          }
        />
      )}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// Minimized dot
// ============================================================

function MinimizedDot({ collection }: { collection: Collection }) {
  const photo = collection.photos[collection.photoIndex];
  // Plain div — no button, no stopPropagation. The parent motion.div
  // handles both drag and tap (tap → restore is wired via onTap on the
  // parent so the dot can be dragged without restoring on click).
  // Wrap with the same Radix Tooltip the toolbar buttons use, instead
  // of the browser-native title attribute, so the hover label is
  // visually consistent with the rest of the chrome.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute inset-[1px] overflow-hidden rounded-full">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #f3d6bd, #b4682b)",
            }}
          />
        )}
          <div className="photo-overlay absolute inset-0 rounded-full" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        Double-tap to expand {collection.name}
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================
// Normal card
// ============================================================

function NormalCard({
  collection,
  currentPhoto,
  name,
  date,
  label,
  onMinimize,
  onFullscreen,
  onAddPhotos,
  onDelete,
  onResizeStart,
  onResizeEnd,
  onResize,
  onPrev,
  onNext,
}: {
  collection: Collection;
  currentPhoto?: string;
  name: string;
  date: string;
  label?: string;
  onMinimize: () => void;
  onFullscreen: () => void;
  onAddPhotos: () => void;
  onDelete: () => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
  onResize: (dw: number, dh: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const hasMany = collection.photos.length > 1;

  // Slide direction for the photo carousel: +1 = next, -1 = prev.
  const [photoDir, setPhotoDir] = useState(1);
  const handlePrev = () => {
    setPhotoDir(-1);
    onPrev();
  };
  const handleNext = () => {
    setPhotoDir(1);
    onNext();
  };

  // ----- resize handle -----
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const onResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    onResizeStart();
  };
  const onResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    onResize(dx, dy);
  };
  const onResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    startRef.current = null;
    onResizeEnd();
  };

  return (
    <div className="absolute inset-0">
      {/* Photo with progressive bottom-to-top blur. Sliding carousel. */}
      <div className="absolute inset-[2px] overflow-hidden rounded-[22px]">
        <AnimatePresence initial={false} custom={photoDir} mode="popLayout">
          <motion.div
            key={collection.photoIndex + "-" + (currentPhoto ?? "fb")}
            custom={photoDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0"
          >
            <BlurPhoto src={currentPhoto} alt={name} blur={9} />
          </motion.div>
        </AnimatePresence>
        <div className="photo-overlay pointer-events-none absolute inset-0 rounded-[22px]" />
      </div>

      {/* Top-left: macOS-style window controls (red close · yellow minimize ·
          green zoom). Fades in on card hover. */}
      <WindowControls
        className="absolute left-3 top-3 z-20 opacity-0 pointer-events-none transition-opacity duration-200 ease-out group-hover/card:opacity-100 group-hover/card:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto"
        onDelete={onDelete}
        onMinimize={onMinimize}
        onFullscreen={onFullscreen}
      />

      {/* Centered drag indicator — fades in on card hover so the photo
          stays uncluttered at rest. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/30 opacity-0 transition-opacity duration-200 ease-out group-hover/card:opacity-100">
        <GripVertical className="h-6 w-6" />
      </div>

      {/* Header text — always visible since top is unblurred */}
      <div className="absolute inset-x-0 top-9 flex flex-col items-center text-white text-center px-3 pointer-events-none">
        <div className="text-[16px] font-light leading-tight drop-shadow-sm">
          {name}
        </div>
        <div className="text-[8px] font-normal leading-tight mt-0.5 drop-shadow-sm">
          {date}
        </div>
      </div>

      {/* Photo nav arrows */}
      {hasMany && (
        <div
          className="absolute left-3 right-3 top-1/2 -translate-y-1/2 flex justify-between z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button
            variant="icon"
            size="iconSm"
            onClick={handlePrev}
            aria-label="Previous photo"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="icon"
            size="iconSm"
            onClick={handleNext}
            aria-label="Next photo"
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      {/* Bottom action row — fades in on card hover */}
      <div
        className="absolute inset-x-0 bottom-7 flex items-center justify-center gap-10 text-white opacity-0 pointer-events-none transition-opacity duration-200 ease-out group-hover/card:opacity-100 group-hover/card:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Photo filter"
              className="grid h-7 w-7 place-items-center rounded-full text-white/90 transition hover:scale-110 hover:bg-white/20 hover:text-white active:scale-90"
            >
              <Contrast className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Photo filter · coming soon</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onAddPhotos}
              aria-label="Add photos"
              className="group/add grid h-7 w-7 place-items-center rounded-full text-white transition-all duration-200 hover:scale-110 hover:bg-white/20 active:scale-90 active:rotate-90"
            >
              <Plus
                className="h-[18px] w-[18px] transition-transform group-active/add:rotate-90"
                strokeWidth={1.6}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>Add photos to this collection</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Collection details"
              className="grid h-7 w-7 place-items-center rounded-full text-white/90 transition hover:scale-110 hover:bg-white/20 hover:text-white active:scale-90"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Collection details · coming soon</TooltipContent>
        </Tooltip>
      </div>

      {/* Bottom label */}
      {label && (
        <div className="absolute inset-x-0 bottom-2 text-center text-[8px] text-white pointer-events-none">
          {label}
        </div>
      )}

      {/* Photo dot indicators */}
      {hasMany && (
        <div
          className="absolute inset-x-0 bottom-[18px] flex items-center justify-center gap-1 z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {collection.photos.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i === collection.photoIndex
                  ? "bg-white w-2.5"
                  : "bg-white/50 w-1"
              )}
            />
          ))}
        </div>
      )}

      {/* Resize handle (bottom-right corner) */}
      <div
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        className="absolute bottom-1 right-1 z-30 grid h-4 w-4 cursor-nwse-resize place-items-center rounded-sm text-white/70 hover:text-white hover:bg-white/20"
        title="Drag to resize"
      >
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="currentColor">
          <circle cx="9" cy="9" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="5" cy="9" r="1" />
        </svg>
      </div>
    </div>
  );
}
