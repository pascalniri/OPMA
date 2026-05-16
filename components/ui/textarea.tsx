import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
                "flex field-sizing-content min-h-16 w-full min-w-0 rounded border border-black/10 bg-transparent px-3 py-2 text-xs font-medium transition-all outline-none placeholder:text-muted-foreground/40 focus-visible:border-black/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500",

        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
