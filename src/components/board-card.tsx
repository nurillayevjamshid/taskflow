"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Board } from "@/lib/types";
import { BOARD_BACKGROUNDS } from "@/lib/backgrounds";
import { useDataStore } from "@/store/data-store";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export function BoardCard({ board }: { board: Board }) {
  const users = useDataStore((s) => s.users);
  const lists = useDataStore((s) => s.lists);
  const cards = useDataStore((s) => s.cards);
  const toggleStar = useDataStore((s) => s.toggleStar);

  const listCount = lists.filter((l) => l.boardId === board.id).length;
  const cardCount = cards.filter((c) => c.boardId === board.id).length;
  const members = users.filter((u) => board.memberIds.includes(u.id));

  return (
    <Link
      href={`/b/${board.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-premium"
    >
      <div
        className="relative h-28 w-full"
        style={{ background: BOARD_BACKGROUNDS[board.background] }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleStar(board.id);
          }}
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
          aria-label={board.starred ? "Yulduzchani olib tashlash" : "Yulduzchaga qo'shish"}
        >
          <Star
            className={cn(
              "size-4",
              board.starred ? "fill-amber-300 text-amber-300" : "text-white/90",
            )}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="truncate text-base font-semibold">{board.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          {listCount} ustun · {cardCount} karta
        </div>
        <div className="mt-3 flex -space-x-2">
          {members.slice(0, 5).map((m) => (
            <UserAvatar key={m.id} user={m} size="sm" ring />
          ))}
          {members.length > 5 && (
            <span className="grid size-7 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
              +{members.length - 5}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
