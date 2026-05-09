import { cn } from "@/lib/utils";
import { PhotoFallback } from "./PhotoFallback";

type Props = {
  src?: string;
  alt?: string;
  /** px of blur on the masked layer. */
  blur?: number;
  className?: string;
};

/**
 * Photo with progressive bottom-to-top blur:
 * - top 1/3: clear
 * - middle 1/3: blur ramps up
 * - bottom 1/3: full blur
 *
 * Implemented as a clear base layer plus a blurred copy masked by a vertical
 * gradient that's transparent at the top and opaque at the bottom.
 */
export function BlurPhoto({ src, alt = "", blur = 8, className }: Props) {
  const mask =
    "linear-gradient(to bottom, transparent 0%, transparent 33%, rgba(0,0,0,0.85) 66%, black 100%)";

  if (!src) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <PhotoFallback />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
        style={{
          filter: `blur(${blur}px)`,
          transform: "scale(1.06)",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </div>
  );
}
