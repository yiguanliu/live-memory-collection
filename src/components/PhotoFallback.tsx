import { cn } from "@/lib/utils";

/** Warm gradient placeholder shown when a collection has no photos. */
export function PhotoFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{
        background: `
          radial-gradient(ellipse at 30% 25%, #f3d6bd 0%, transparent 60%),
          radial-gradient(ellipse at 70% 75%, #b4682b 0%, transparent 65%),
          linear-gradient(160deg, #6b3a1f 0%, #c47a48 55%, #f1c69d 100%)
        `,
      }}
    />
  );
}
