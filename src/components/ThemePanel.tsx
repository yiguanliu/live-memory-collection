import { Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  DOT_SIZE_PX,
  THEMES,
  type DotSize,
  type Settings,
  type ThemeName,
} from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  settings: Settings;
  onChange: (next: Settings) => void;
};

const THEME_LABELS: Record<ThemeName, string> = {
  sunset: "Sunset",
  mist: "Mist",
  sage: "Sage",
  plum: "Plum",
};

const SIZE_LABELS: Record<DotSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
};

export function ThemePanel({ settings, onChange }: Props) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger
            aria-label="Theme & sizing"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
          >
            <Palette className="h-4 w-4" />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Theme &amp; sizing</TooltipContent>
      </Tooltip>
      <PopoverContent side="right" align="center" sideOffset={12}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold">Theme</h3>
            <p className="text-xs text-stone-500">
              Color scheme for the whole canvas.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(THEMES) as ThemeName[]).map((name) => {
              const palette = THEMES[name];
              const active = settings.theme === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onChange({ ...settings, theme: name })}
                  className={cn(
                    "group/swatch flex flex-col items-center gap-1.5 rounded-md border p-1.5 transition",
                    active
                      ? "border-stone-800 bg-white"
                      : "border-stone-200 bg-white/60 hover:border-stone-400"
                  )}
                  aria-pressed={active}
                >
                  <span
                    className="h-9 w-full rounded"
                    style={{
                      background: `radial-gradient(ellipse at 25% 20%, ${palette.from} 0%, ${palette.via} 55%, ${palette.to} 100%)`,
                    }}
                  />
                  <span className="text-[10px] font-medium text-stone-700">
                    {THEME_LABELS[name]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-2 border-t border-stone-200 pt-3">
            <div className="grid gap-1">
              <Label>Memory size</Label>
              <p className="text-[11px] text-stone-500">
                Diameter of the minimized dot.
              </p>
            </div>
            <div className="flex items-center justify-around">
              {(Object.keys(DOT_SIZE_PX) as DotSize[]).map((size) => {
                const px = DOT_SIZE_PX[size];
                const active = settings.dotSize === size;
                const themeRgb = THEMES[settings.theme].overlayRgb;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onChange({ ...settings, dotSize: size })}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded p-2 transition",
                      active
                        ? "bg-white/40 ring-1 ring-stone-800/40"
                        : "hover:bg-white/20"
                    )}
                    aria-pressed={active}
                  >
                    <span
                      className="rounded-full"
                      style={{
                        width: px,
                        height: px,
                        background: `rgb(${themeRgb.replaceAll(" ", ", ")})`,
                      }}
                    />
                    <span className="text-[10px] font-medium text-stone-700">
                      {SIZE_LABELS[size]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
