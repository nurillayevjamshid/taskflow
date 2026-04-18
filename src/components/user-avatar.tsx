"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initialsFromName, pickAvatarColor } from "@/lib/hash";
import type { User } from "@/lib/types";

interface Props {
  user: Pick<User, "name" | "avatarColor"> | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  ring?: boolean;
}

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
};

export function UserAvatar({ user, size = "sm", className, ring }: Props) {
  const name = user?.name ?? "?";
  const color = user?.avatarColor ?? pickAvatarColor(name);
  return (
    <Avatar
      className={cn(
        SIZES[size],
        ring && "ring-2 ring-background",
        "shrink-0",
        className,
      )}
    >
      <AvatarFallback
        className="font-semibold text-white"
        style={{
          background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 70%, #111))`,
        }}
      >
        {initialsFromName(name)}
      </AvatarFallback>
    </Avatar>
  );
}
