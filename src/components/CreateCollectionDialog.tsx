import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uid } from "@/lib/utils";
import type { Collection } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (collection: Collection) => void;
  spawnPosition: { x: number; y: number };
  nextZ: number;
};

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreate,
  spawnPosition,
  nextZ,
}: Props) {
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
    if (!name.trim() || previews.length === 0) return;
    const id = uid();
    // We hand the object URLs to the parent — keep them alive there.
    // Detach from local cleanup by capturing their values.
    const photos = files.map((f) => URL.createObjectURL(f));
    onCreate({
      id,
      name: name.trim(),
      date: date.trim() || new Date().toLocaleDateString(),
      label: label.trim() || undefined,
      photos,
      position: spawnPosition,
      size: { w: 220, h: 280 },
      state: "normal",
      photoIndex: 0,
      z: nextZ,
    });
    onOpenChange(false);
  };

  const canSubmit = name.trim().length > 0 && previews.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New memory collection</DialogTitle>
          <DialogDescription>
            Add a name, date and one or more photos from your computer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
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
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500 transition hover:border-peach-300 hover:bg-peach-50/50"
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-stone-300 text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>
            <ImagePlus />
            Create collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
