"use client";

import { useState } from "react";
import { Check, Plus, Search, UserPlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  allUsers: User[];
  selectedIds: string[];
  onToggle: (userId: string) => void;
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
  title?: string;
}

export function MemberPicker({
  allUsers,
  selectedIds,
  onToggle,
  trigger,
  align = "start",
  title = "A'zolarni boshqarish",
}: Props) {
  const [query, setQuery] = useState("");
  const filtered = allUsers.filter((u) =>
    (u.name + " " + u.email).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5">
              <UserPlus className="size-3.5" />
              A&apos;zo qo&apos;shish
            </Button>
          )
        }
      />
      <PopoverContent align={align} className="w-72 p-0">
        <div className="border-b border-border p-3">
          <div className="text-sm font-semibold">{title}</div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Qidirish…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Hech kim topilmadi
            </div>
          ) : (
            filtered.map((u) => {
              const active = selectedIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => onToggle(u.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-accent",
                    active && "bg-accent/60",
                  )}
                >
                  <UserAvatar user={u} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{u.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full border",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {active ? (
                      <Check className="size-3" />
                    ) : (
                      <Plus className="size-3" />
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
