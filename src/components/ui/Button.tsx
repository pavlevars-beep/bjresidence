import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "outlineLight" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-olive-dark text-cream hover:bg-[#4a5241] shadow-soft",
  secondary: "bg-wood text-cream hover:bg-[#94663f] shadow-soft",
  outline: "border border-ink/15 text-ink hover:border-olive-dark hover:text-olive-dark bg-transparent",
  outlineLight: "border border-cream/30 text-cream bg-transparent hover:bg-cream/10",
  ghost: "text-ink hover:bg-ink/5",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap";

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
  target,
  rel,
}: CommonProps & { href: string; target?: string; rel?: string }) {
  const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  if (isExternal) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={cn(baseClasses, variantClasses[variant], className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </Link>
  );
}
