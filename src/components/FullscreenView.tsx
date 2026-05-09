import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Collection } from "@/types";
import { PhotoFallback } from "./PhotoFallback";

type Props = {
  collection: Collection;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDeleteCurrent: () => void;
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};
const slideTransition = {
  x: { type: "spring" as const, stiffness: 280, damping: 32 },
  opacity: { duration: 0.2 },
};

export function FullscreenView({
  collection,
  onBack,
  onPrev,
  onNext,
  onDeleteCurrent,
}: Props) {
  const photo = collection.photos[collection.photoIndex];
  const hasMany = collection.photos.length > 1;
  const [confirming, setConfirming] = useState(false);
  const [photoDir, setPhotoDir] = useState(1);
  const handlePrev = () => {
    setPhotoDir(-1);
    onPrev();
  };
  const handleNext = () => {
    setPhotoDir(1);
    onNext();
  };

  return (
    <motion.div
      key="fullscreen"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.7 }}
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
    >
      <AnimatePresence initial={false} custom={photoDir} mode="popLayout">
        <motion.div
          key={collection.photoIndex + "-" + (photo ?? "fb")}
          custom={photoDir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="absolute inset-0 flex items-center justify-center"
        >
          {photo ? (
            <img
              src={photo}
              alt={collection.name}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="relative h-full w-full">
              <PhotoFallback />
              <div className="absolute inset-0 grid place-items-center text-white/70">
                No photos in this collection.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient legibility overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Top bar */}
      <div className="absolute left-5 top-5 z-10">
        <Button variant="default" size="default" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
      </div>
      <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
          {collection.photos.length > 0
            ? `${collection.photoIndex + 1} / ${collection.photos.length}`
            : "0 / 0"}
        </span>
        <DeleteControl
          confirming={confirming}
          disabled={collection.photos.length === 0}
          onArm={() => setConfirming(true)}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDeleteCurrent();
          }}
        />
      </div>

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center text-white">
        <div className="text-3xl font-light">{collection.name}</div>
        <div className="text-sm opacity-80 mt-1">{collection.date}</div>
        {collection.label && (
          <div className="text-xs opacity-70 mt-1">{collection.label}</div>
        )}
        {hasMany && (
          <div className="mt-3 flex items-center gap-1.5">
            {collection.photos.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (i === collection.photoIndex
                    ? "bg-white w-4"
                    : "bg-white/40 w-1.5")
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Photo nav */}
      {hasMany && (
        <>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="icon"
              size="icon"
              onClick={handlePrev}
              aria-label="Previous photo"
            >
              <ChevronLeft />
            </Button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="icon"
              size="icon"
              onClick={handleNext}
              aria-label="Next photo"
            >
              <ChevronRight />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ----------------------------------------------------------------
// Two-stage delete control: trash → confirm pill (with Cancel + Delete)
// ----------------------------------------------------------------
function DeleteControl({
  confirming,
  disabled,
  onArm,
  onCancel,
  onConfirm,
}: {
  confirming: boolean;
  disabled: boolean;
  onArm: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {confirming ? (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.9, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-1.5 py-1 backdrop-blur-md"
        >
          <span className="px-2 text-xs text-white/85">Delete photo?</span>
          <button
            onClick={onCancel}
            className="grid h-7 w-7 place-items-center rounded-full text-white/80 transition hover:bg-white/15 active:scale-90"
            aria-label="Cancel delete"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={onConfirm}
            className="grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-400 active:scale-90"
            aria-label="Confirm delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="arm"
          onClick={onArm}
          disabled={disabled}
          aria-label="Delete current photo"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white/90 backdrop-blur-md transition hover:bg-red-500/80 hover:text-white active:scale-90 disabled:opacity-40 disabled:hover:bg-white/15 disabled:hover:text-white/90 disabled:cursor-not-allowed"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
