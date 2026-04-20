"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import {
  BOARD_BACKGROUNDS,
  BOARD_BACKGROUND_OPTIONS,
} from "@/lib/backgrounds";
import type { BoardBackground } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CreateBoardDialog({
  workspaceId,
  trigger,
  onCreated,
}: {
  workspaceId?: string;
  trigger?: React.ReactNode;
  onCreated?: (boardId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [bg, setBg] = useState<BoardBackground>("gradient-violet");
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId ?? "");
  const router = useRouter();

  const workspaces = useDataStore((s) => s.workspaces);
  const createBoard = useDataStore((s) => s.createBoard);
  const currentUserId = useAuthStore((s) => s.currentUserId);

  const myWorkspaces = workspaces.filter((w) =>
    w.memberIds.includes(currentUserId ?? ""),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !name.trim()) return;
    const targetWs = selectedWorkspace || myWorkspaces[0]?.id;
    if (!targetWs) return;
    const board = createBoard(targetWs, name, bg, currentUserId);
    setOpen(false);
    setName("");
    if (onCreated) onCreated(board.id);
    else router.push(`/b?id=${board.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button>
              <Plus className="size-4" />
              Doska yaratish
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi doska</DialogTitle>
          <DialogDescription>
            Doska loyihangiz yoki vazifalar to&apos;plami uchun ish maydonchasi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Fon</Label>
            <div className="grid grid-cols-3 gap-2">
              {BOARD_BACKGROUND_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBg(opt)}
                  className={cn(
                    "h-16 rounded-xl border transition",
                    bg === opt
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border hover:border-primary/40",
                  )}
                  style={{ background: BOARD_BACKGROUNDS[opt] }}
                  aria-label={opt}
                />
              ))}
            </div>
          </div>
          {!workspaceId && myWorkspaces.length > 1 && (
            <div className="space-y-2">
              <Label>Ish maydoni</Label>
              <Select
                value={selectedWorkspace || myWorkspaces[0]?.id}
                onValueChange={(v) => setSelectedWorkspace(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ish maydonini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {myWorkspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Doska nomi</Label>
            <Input
              id="name"
              placeholder="Masalan, Marketing loyihasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Yaratish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
