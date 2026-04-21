import Link from "next/link";
import { cn } from "@/lib/utils";

export function TasklyMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="22" y="10" width="14" height="35" rx="7" />
      <rect x="40" y="10" width="16" height="78" rx="8" />
      <rect x="61" y="10" width="13" height="20" rx="6.5" />
    </svg>
  );
}

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
  const mark =
    size === "lg" ? "size-8" : size === "sm" ? "size-5" : "size-7";
  const content = (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <TasklyMark className={cn(mark, "text-[#0E9BB5]")} />
      <span className={cn(text, "tracking-tight")}>
        Task<span className="text-gradient">ly</span>
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
