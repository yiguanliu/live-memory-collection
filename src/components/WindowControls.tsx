import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Minus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onDelete: () => void;
  onMinimize: () => void;
  onFullscreen: () => void;
  className?: string;
};

/**
 * macOS-style traffic-light controls.
 *
 * Order matches the system: red (close) · yellow (minimize) · green (zoom).
 * Glyphs inside each dot reveal on group hover. The red close uses a
 * two-stage confirm — clicking it morphs the row into a small confirm
 * pill so an accidental click never destroys a collection.
 */
export function WindowControls({
  onDelete,
  onMinimize,
  onFullscreen,
  className,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={cn("relative", className)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9, x: -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -4 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-1.5 py-0.5 backdrop-blur-md"
            style={{ transformOrigin: "left center" }}
          >
            <span className="select-none px-1 text-[10px] font-medium text-white/85">
              Delete?
            </span>
            <button
              onClick={() => setConfirming(false)}
              className="grid h-4 w-4 place-items-center rounded-full text-white/85 transition hover:bg-white/15 active:scale-90"
              aria-label="Cancel delete"
            >
              <X className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                onDelete();
              }}
              className="grid h-4 w-4 place-items-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-400 active:scale-90"
              aria-label="Confirm delete"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dots"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="group/lights flex items-center gap-1.5"
            style={{ transformOrigin: "left center" }}
          >
            <button
              onClick={() => setConfirming(true)}
              aria-label="Delete collection"
              className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] shadow-[0_0_0_0.5px_rgba(0,0,0,0.18)] transition-transform hover:scale-110 active:scale-90"
            >
              <X
                strokeWidth={3}
                className="h-2 w-2 text-stone-900/70 opacity-0 transition-opacity group-hover/lights:opacity-100"
              />
            </button>
            <button
              onClick={onMinimize}
              aria-label="Minimize to dot"
              className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#fdbc40] shadow-[0_0_0_0.5px_rgba(0,0,0,0.18)] transition-transform hover:scale-110 active:scale-90"
            >
              <Minus
                strokeWidth={3}
                className="h-2 w-2 text-stone-900/70 opacity-0 transition-opacity group-hover/lights:opacity-100"
              />
            </button>
            <button
              onClick={onFullscreen}
              aria-label="Open fullscreen"
              className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#34c84a] shadow-[0_0_0_0.5px_rgba(0,0,0,0.18)] transition-transform hover:scale-110 active:scale-90"
            >
              <Maximize2
                strokeWidth={3}
                className="h-1.5 w-1.5 text-stone-900/70 opacity-0 transition-opacity group-hover/lights:opacity-100"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
