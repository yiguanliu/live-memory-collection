import {
  ArrowDownWideNarrow,
  Circle as CircleIcon,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SortMode } from "@/lib/layout";

type Props = {
  onSort: (mode: SortMode) => void;
};

const OPTIONS: {
  mode: SortMode;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    mode: "size",
    label: "Sort by size",
    hint: "Largest cards first",
    icon: ArrowDownWideNarrow,
  },
  {
    mode: "grid",
    label: "Arrange in grid",
    hint: "Even rows and columns",
    icon: LayoutGrid,
  },
  {
    mode: "circular",
    label: "Arrange in circle",
    hint: "Distribute around the center",
    icon: CircleIcon,
  },
];

export function SortPanel({ onSort }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Arrange cards"
        className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
      >
        <LayoutGrid className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold">Arrange cards</h3>
            <p className="text-xs text-stone-500">
              Pick a layout — cards animate to their new positions.
            </p>
          </div>
          <div className="grid gap-1">
            {OPTIONS.map(({ mode, label, hint, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onSort(mode)}
                className="flex items-center gap-3 rounded-md border border-transparent px-2 py-2 text-left transition hover:border-stone-200 hover:bg-stone-50 active:scale-[0.99]"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-peach-50 text-peach-600">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="grid">
                  <span className="text-xs font-medium text-stone-800">
                    {label}
                  </span>
                  <span className="text-[11px] text-stone-500">{hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
