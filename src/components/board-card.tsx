"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MoreHorizontal, LogOut } from "lucide-react";
import type { Board } from "@/lib/types";
import { BOARD_BACKGROUNDS } from "@/lib/backgrounds";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function BoardCard({ board }: { board: Board }) {
  const users = useDataStore((s) => s.users);
  const lists = useDataStore((s) => s.lists);
  const cards = useDataStore((s) => s.cards);
  const toggleStar = useDataStore((s) => s.toggleStar);
  const leaveBoard = useDataStore((s) => s.leaveBoard);
  const addBoardMember = useDataStore((s) => s.addBoardMember);
  const currentUserId = useAuthStore((s) => s.currentUserId);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [leftBoardId, setLeftBoardId] = useState<string | null>(null);

  const listCount = lists.filter((l) => l.boardId === board.id).length;
  const cardCount = cards.filter((c) => c.boardId === board.id).length;
  const members = users.filter((u) => board.memberIds.includes(u.id));

  const handleLeaveBoard = () => {
    if (!currentUserId) return;
    
    leaveBoard(board.id, currentUserId);
    setLeftBoardId(board.id);
    setCountdown(7);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setLeftBoardId(null);
          setCountdown(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUndoLeave = () => {
    if (leftBoardId && currentUserId) {
      addBoardMember(leftBoardId, currentUserId);
      setLeftBoardId(null);
      setCountdown(null);
    }
  };

  if (leftBoardId === board.id && countdown !== null) {
    return (
      <div className="relative block overflow-hidden rounded-2xl border border-border bg-card p-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Doskadan chiqdingiz
          </p>
          <Button onClick={handleUndoLeave} className="w-full">
            Doskaga qaytish ({countdown}s)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Link
      href={`/b?id=${board.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-premium"
    >
      <div
        className="relative h-28 w-full"
        style={{ background: BOARD_BACKGROUNDS[board.background] }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleStar(board.id);
            }}
            className="grid size-8 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
            aria-label={board.starred ? "Yulduzchani olib tashlash" : "Yulduzchaga qo'shish"}
          >
            <Star
              className={cn(
                "size-4",
                board.starred ? "fill-amber-300 text-amber-300" : "text-white/90",
              )}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="grid size-8 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25">
                  <MoreHorizontal className="size-4 text-white/90" />
                </button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setShowLeaveConfirm(true);
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="size-4 mr-2" />
                Doskadan chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl bg-card p-6 shadow-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Doskadan chiqish</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Haqiqatan chiqishni xohlaysizmi?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLeaveConfirm(false)}
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleLeaveBoard();
                  setShowLeaveConfirm(false);
                }}
              >
                Xohlayman
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
