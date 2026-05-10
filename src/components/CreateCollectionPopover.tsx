import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type NewCollectionInput = {
  name: string;
  date: string;
  label?: string;
  photos: string[];
};

type Props = {
  onCreate: (input: NewCollectionInput) => void;
};

export function CreateCollectionPopover({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build object URLs for preview, revoke on unmount or when files change.
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Reset the form when the popover closes.
  useEffect(() => {
    if (!open) {
      setName("");
      setDate("");
      setLabel("");
      setFiles([]);
    }
  }, [open]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = ""; // allow re-picking same file
  };

  const removeAt = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!name.trim() || files.length === 0) return;
    // Hand the object URLs to the parent — keep them alive there. Detach
    // from local cleanup by creating fresh URLs (the previews list will
    // be revoked when the popover closes / files state resets).
    const photos = files.map((f) => URL.createObjectURL(f));
    onCreate({
      name: name.trim(),
      date: date.trim() || new Date().toLocaleDateString(),
      label: label.trim() || undefined,
      photos,
    });
    setOpen(false);
  };

  const canSubmit = name.trim().length > 0 && files.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger
            aria-label="New collection"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">New collection</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="left"
        align="center"
        sideOffset={10}
        className="w-[400px]"
      >
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold">New memory collection</h3>
            <p className="text-xs text-stone-500">
              Add a name, date and one or more photos from your computer.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mira Patel"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="14th July, 2024"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="label">Label (optional)</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Coastal Dreams"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Photos</Label>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPick}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500 transition hover:border-peach-300 hover:bg-peach-50/50"
              >
                <Upload className="h-5 w-5 text-stone-400" />
                <span>Click to choose images from your computer</span>
                <span className="text-xs text-stone-400">PNG, JPG, WebP</span>
              </button>

              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((src, i) => (
                    <div
                      key={src}
                      className="group relative aspect-square overflow-hidden rounded-md border border-stone-200"
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAt(i)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-stone-300 text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={!canSubmit}>
              <ImagePlus />
              Create collection
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
