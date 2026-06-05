import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal button. Uses the white-label brand tokens from globals.css so it
 * recolors automatically per customer. Replace with shadcn/ui Button later if desired.
 */
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
