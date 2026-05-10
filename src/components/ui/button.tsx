import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-white/15 text-white backdrop-blur-md border border-white/30 hover:bg-white/25 active:bg-white/35 active:scale-[0.97]",
        primary:
          "bg-[var(--accent,#e2a87a)] text-white shadow-[0_4px_12px_rgb(var(--accent-deep-rgb,180_104_43)/0.35)] hover:opacity-90 active:scale-[0.97]",
        ghost:
          "hover:bg-white/15 text-white active:bg-white/25 active:scale-[0.94]",
        outline:
          "border border-white/40 bg-transparent text-white hover:bg-white/10 active:scale-[0.97]",
        icon:
          "text-white/90 hover:text-white hover:bg-white/15 active:bg-white/25 active:scale-90 rounded-full",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
        iconSm: "h-7 w-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
