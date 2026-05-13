import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer  items-center justify-center rounded-md border border-transparent bg-clip-padding  font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:opacity-90 ",
        outline:
          "border border-black/10 bg-transparent text-foreground hover:bg-black/5 hover:border-black/20 ",
        secondary:
          "bg-black/5 text-foreground hover:bg-black/10",
        ghost:
          "text-muted-foreground hover:bg-black/5 hover:text-foreground",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-600 ",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "text-[11px] font-bold px-4 py-2 gap-2 rounded ",
        xs: "text-[10px] font-bold h-7 px-2 gap-1.5 rounded",
        sm: "text-[11px] font-bold h-8 px-3 gap-1.5 rounded",
        lg: "text-[12px] font-bold h-11 px-6 gap-2 rounded ",
        icon: "size-8 rounded flex items-center justify-center",
        "icon-xs": "size-6 rounded flex items-center justify-center",
        "icon-sm": "size-7 rounded flex items-center justify-center",
        "icon-lg": "size-10 rounded flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
