import { Settings as SettingsIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { PatternType, Settings } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  settings: Settings;
  onChange: (next: Settings) => void;
};

const PATTERNS: { value: PatternType; label: string }[] = [
  { value: "dot", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "none", label: "Off" },
];

export function SettingsPanel({ settings, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Open settings"
        className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
      >
        <SettingsIcon className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold">Background</h3>
            <p className="text-xs text-stone-500">
              Pattern and ambient motion behind the cards.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Pattern</Label>
            <div className="flex rounded-md border border-stone-200 bg-stone-50 p-0.5">
              {PATTERNS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onChange({ ...settings, pattern: p.value })}
                  className={cn(
                    "flex-1 rounded px-2 py-1 text-xs font-medium transition",
                    settings.pattern === p.value
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Density</Label>
              <span className="text-xs text-stone-500">
                {settings.density}px
              </span>
            </div>
            <Slider
              min={12}
              max={80}
              step={2}
              value={[settings.density]}
              onValueChange={([v]) => onChange({ ...settings, density: v })}
              disabled={settings.pattern === "none"}
              className={settings.pattern === "none" ? "opacity-40" : ""}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="grid gap-0.5">
              <Label>Snap to grid</Label>
              <p className="text-[11px] text-stone-500">
                Cards land on the pattern points.
              </p>
            </div>
            <Toggle
              pressed={settings.snap}
              onPressedChange={(v) => onChange({ ...settings, snap: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="grid gap-0.5">
              <Label>Wave animation</Label>
              <p className="text-[11px] text-stone-500">
                Sin-wave motion in the background.
              </p>
            </div>
            <Toggle
              pressed={settings.showWaves}
              onPressedChange={(v) => onChange({ ...settings, showWaves: v })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Toggle({
  pressed,
  onPressedChange,
}: {
  pressed: boolean;
  onPressedChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPressedChange(!pressed)}
      aria-pressed={pressed}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors",
        pressed ? "bg-peach-300" : "bg-stone-300"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
          pressed ? "left-[18px]" : "left-0.5"
        )}
      />
    </button>
  );
}
