import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "soft";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-medium tracking-wide",
        "relative z-10 cursor-pointer select-none touch-manipulation",
        "transition-[background-color,color,box-shadow,opacity] duration-150 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" &&
          "bg-saffron text-on-saffron shadow-card hover:bg-saffron-deep",
        variant === "secondary" &&
          "bg-surface text-ink shadow-card hover:bg-cream",
        variant === "ghost" && "bg-transparent text-ink hover:bg-surface-2",
        variant === "soft" && "bg-saffron-soft text-saffron-deep",
        className,
      )}
      {...props}
    />
  );
}
