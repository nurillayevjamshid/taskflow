import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  size = "md",
}: {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "lg"
      ? "text-2xl"
      : size === "sm"
        ? "text-base"
        : "text-xl";
  const dot =
    size === "lg" ? "size-8" : size === "sm" ? "size-5" : "size-7";
  const content = (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <span
        className={cn(
          "relative grid place-items-center rounded-xl shadow-premium",
          dot,
        )}
        style={{
          background:
            "linear-gradient(135deg, oklch(0.62 0.22 283), oklch(0.68 0.2 340))",
        }}
      >
        <span className="size-1.5 rounded-full bg-white/90" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </span>
      <span className={cn(text, "tracking-tight")}>
        Task<span className="text-gradient">Flow</span>
      </span>
    </span>
  );
  if (href === null) return content;
  return (
    <Link href={href} className="group">
      {content}
    </Link>
  );
}
