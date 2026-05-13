import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded border border-black/10 bg-transparent px-3 py-2 text-[13px] font-medium transition-all outline-none placeholder:text-muted-foreground/40 focus-visible:border-black/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
