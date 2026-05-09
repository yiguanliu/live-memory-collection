import { Maximize2, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onMinimize: () => void;
  onFullscreen: () => void;
  className?: string;
};

/**
 * macOS-style traffic-light window controls. Yellow = minimize-to-dot,
 * green = fullscreen. Icons reveal on group hover.
 */
export function WindowControls({ onMinimize, onFullscreen, className }: Props) {
  return (
    <div
      className={cn("group flex items-center gap-1.5", className)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onMinimize}
        aria-label="Minimize to dot"
        className={cn(
          "relative flex h-3 w-3 items-center justify-center rounded-full",
          "bg-[#fdbc40] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]",
          "transition-transform hover:scale-110 active:scale-90"
        )}
      >
        <Minus
          strokeWidth={3}
          className="h-2 w-2 text-stone-800/70 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
      <button
        onClick={onFullscreen}
        aria-label="Open fullscreen"
        className={cn(
          "relative flex h-3 w-3 items-center justify-center rounded-full",
          "bg-[#34c84a] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]",
          "transition-transform hover:scale-110 active:scale-90"
        )}
      >
        <Maximize2
          strokeWidth={3}
          className="h-1.5 w-1.5 text-stone-800/70 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
    </div>
  );
}
