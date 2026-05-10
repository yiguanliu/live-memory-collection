import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-stone-200">
      <SliderPrimitive.Range
        className="absolute h-full"
        style={{ background: "var(--accent, #e2a87a)" }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full bg-white shadow transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2"
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--accent, #e2a87a)",
        // Tailwind's focus-visible:ring uses --tw-ring-color; set it here.
        ["--tw-ring-color" as string]:
          "rgb(var(--accent-rgb, 226 168 122) / 0.5)",
      }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
