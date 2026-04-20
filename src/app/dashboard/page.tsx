"use client";

import { useMemo } from "react";
import { Star, LayoutGrid } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AuthGuard } from "@/components/auth-guard";
import { BoardCard } from "@/components/board-card";
import { CreateBoardDialog } from "@/components/create-board-dialog";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";
import { UserAvatar } from "@/components/user-avatar";
import { useTranslation } from "@/lib/i18n";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const currentUserId = useAuthStore((s) => s.currentUserId)!;
  const users = useDataStore((s) => s.users);
  const workspaces = useDataStore((s) => s.workspaces);
  const boards = useDataStore((s) => s.boards);
  const user = users.find((u) => u.id === currentUserId);
  const { t } = useTranslation();

  const myWorkspaces = useMemo(
    () => workspaces.filter((w) => w.memberIds.includes(currentUserId)),
    [workspaces, currentUserId],
  );

  const boardsByWorkspace = useMemo(() => {
    const map = new Map<string, typeof boards>();
    for (const w of myWorkspaces) {
      map.set(
        w.id,
        boards.filter(
          (b) => b.workspaceId === w.id && !b.archived,
        ),
      );
    }
    return map;
  }, [boards, myWorkspaces]);

  const starred = boards.filter(
    (b) => b.starred && b.memberIds.includes(currentUserId),
  );

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] bg-aurora opacity-40" />

      <AppHeader />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              {user && <UserAvatar user={user} size="lg" />}
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("welcome")}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {user?.name ?? ""}
                </h1>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              {t("dashboardDescription")}
            </p>
          </div>
          <div className="flex gap-2">
            <CreateWorkspaceDialog />
            <CreateBoardDialog />
          </div>
        </section>

        {starred.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("starredBoards")}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {starred.map((b) => (
                <BoardCard key={b.id} board={b} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 space-y-10">
          {myWorkspaces.length === 0 ? (
            <EmptyState />
          ) : (
            myWorkspaces.map((w) => {
              const wBoards = boardsByWorkspace.get(w.id) ?? [];
              return (
                <div key={w.id}>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <LayoutGrid className="size-4 text-muted-foreground" />
                        {w.name}
                      </h2>
                      {w.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {w.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {users
                          .filter((u) => w.memberIds.includes(u.id))
                          .slice(0, 5)
                          .map((m) => (
                            <UserAvatar key={m.id} user={m} size="sm" ring />
                          ))}
                      </div>
                      <CreateBoardDialog
                        workspaceId={w.id}
                        trigger={
                          <Button size="sm" variant="outline">
                            {t("addBoard")}
                          </Button>
                        }
                      />
                    </div>
                  </div>
                  {wBoards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                      {t("emptyWorkspace")}
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {wBoards.map((b) => (
                        <BoardCard key={b.id} board={b} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-fuchsia-500/10 text-primary">
        <LayoutGrid className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{t("noWorkspace")}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {t("workspaceDescription")}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <CreateWorkspaceDialog />
      </div>
    </div>
  );
}
