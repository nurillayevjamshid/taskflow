"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  LayoutDashboard,
  MoreHorizontal,
  Star,
  Trash2,
  UserPlus,
} from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { MemberPicker } from "@/components/member-picker";
import { BoardView } from "@/components/kanban/board-view";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { BOARD_BACKGROUNDS } from "@/lib/backgrounds";
import { cn } from "@/lib/utils";

export default function BoardPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <BoardPageSearchParams />
      </Suspense>
    </AuthGuard>
  );
}

function BoardPageSearchParams() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("id") ?? "";
  return <BoardPageContent boardId={boardId} />;
}

function BoardPageContent({ boardId }: { boardId: string }) {
  const router = useRouter();
  const subscribeBoard = useDataStore((s) => s.subscribeBoard);

  useEffect(() => {
    if (!boardId) return;
    const unsub = subscribeBoard(boardId);
    return () => unsub();
  }, [boardId, subscribeBoard]);

  const board = useDataStore((s) => s.boards.find((b) => b.id === boardId));
  const workspace = useDataStore((s) =>
    board ? s.workspaces.find((w) => w.id === board.workspaceId) : undefined,
  );
  const users = useDataStore((s) => s.users);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const currentUser = users.find((u) => u.id === currentUserId);
  const toggleStar = useDataStore((s) => s.toggleStar);
  const deleteBoard = useDataStore((s) => s.deleteBoard);
  const addBoardMember = useDataStore((s) => s.addBoardMember);
  const removeBoardMember = useDataStore((s) => s.removeBoardMember);

  useEffect(() => {
    if (!board) return;
    // Auto-add currentUser to board if they're the workspace owner but not a member yet.
    if (
      currentUserId &&
      !board.memberIds.includes(currentUserId) &&
      workspace?.memberIds.includes(currentUserId)
    ) {
      addBoardMember(board.id, currentUserId);
    }
  }, [board, workspace, currentUserId, addBoardMember]);

  if (!board) {
    return (
      <div className="min-h-screen grid place-items-center text-center">
        <div>
          <p className="text-muted-foreground">
            Bunday doska topilmadi yoki sizda ruxsat yo&apos;q.
          </p>
          <Button
            render={<Link href="/dashboard" />}
            nativeButton={false}
            className="mt-4"
          >
            <LayoutDashboard className="size-4" />
            Dashboardga qaytish
          </Button>
        </div>
      </div>
    );
  }

  const boardMembers = users.filter((u) => board.memberIds.includes(u.id));

  return (
    <div
      className="relative flex h-screen flex-col"
      style={{ background: BOARD_BACKGROUNDS[board.background] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <header className="relative z-20 border-b border-white/10 bg-black/10 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 text-white sm:px-6">
          <Link
            href="/dashboard"
            className="rounded-full p-1.5 transition hover:bg-white/15"
            aria-label="Dashboard"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <Logo className="text-white [&_span]:!text-white" href={null} size="sm" />
          <span className="mx-2 h-4 w-px bg-white/30" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {board.name}
            </span>
            <button
              onClick={() => toggleStar(board.id)}
              className="rounded-full p-1 transition hover:bg-white/15"
              aria-label="Yulduzchaga qo'shish"
            >
              <Star
                className={cn(
                  "size-4",
                  board.starred
                    ? "fill-amber-300 text-amber-300"
                    : "text-white/80",
                )}
              />
            </button>
            {workspace && (
              <span className="hidden truncate text-xs text-white/70 sm:inline">
                · {workspace.name}
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex -space-x-2">
              {boardMembers.slice(0, 5).map((m) => (
                <UserAvatar key={m.id} user={m} size="sm" ring />
              ))}
              {boardMembers.length > 5 && (
                <span className="grid size-7 place-items-center rounded-full border-2 border-background bg-white/30 text-[10px] font-medium text-white">
                  +{boardMembers.length - 5}
                </span>
              )}
            </div>
            <MemberPicker
              allUsers={users.filter((u) => u.id !== currentUserId || true)}
              selectedIds={board.memberIds}
              onToggle={(uid) => {
                if (board.memberIds.includes(uid))
                  removeBoardMember(board.id, uid);
                else addBoardMember(board.id, uid);
              }}
              title="Doska a'zolari"
              trigger={
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/15 text-white hover:bg-white/25"
                >
                  <UserPlus className="size-3.5" />
                  Taklif
                </Button>
              }
            />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/15 hover:text-white"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    if (
                      confirm(
                        "Bu doska va barcha ustun, kartalarini o'chirasizmi?",
                      )
                    ) {
                      deleteBoard(board.id);
                      router.push("/dashboard");
                    }
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Doskani o&apos;chirish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {currentUser && (
              <Link
                href="/dashboard"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Dashboard"
              >
                <UserAvatar user={currentUser} size="md" ring />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full pt-6">
          <BoardView boardId={board.id} />
        </div>
      </div>
    </div>
  );
}
