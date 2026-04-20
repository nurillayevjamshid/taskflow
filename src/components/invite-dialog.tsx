"use client";

import { useState } from "react";
import { Mail, UserPlus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";

interface Props {
  boardId: string;
  trigger?: React.ReactNode;
}

export function InviteDialog({ boardId, trigger }: Props) {
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const users = useDataStore((s) => s.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const board = useDataStore((s) => s.boards.find((b) => b.id === boardId));
  const allInvitations = useDataStore((s) => s.invitations);
  const pendingForBoard = allInvitations.filter(
    (i) => i.boardId === boardId && i.status === "pending",
  );

  const sendInvitation = useDataStore((s) => s.sendInvitation);
  const cancelInvitation = useDataStore((s) => s.cancelInvitation);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Avval tizimga kiring");
      return;
    }
    setBusy(true);
    try {
      await sendInvitation(boardId, email, currentUser);
      toast.success(`Taklif yuborildi: ${email.trim().toLowerCase()}`);
      setEmail("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Taklif yuborishda xatolik";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5">
              <UserPlus className="size-3.5" />
              Email bilan taklif
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-4" />
            Doskaga taklif qilish
          </DialogTitle>
          <DialogDescription>
            {board
              ? `"${board.name}" doskasiga hamkoringizni email orqali taklif qiling. U ro'yxatdan o'tgan bo'lsa, bildirishnomada ko'radi.`
              : "Doska topilmadi"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="flex items-start gap-2">
          <Input
            type="email"
            autoComplete="email"
            placeholder="hamkor@taskly.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            required
          />
          <Button type="submit" disabled={busy || !email.trim()}>
            {busy ? "Yuborilmoqda…" : "Yuborish"}
          </Button>
        </form>

        {pendingForBoard.length > 0 && (
          <div className="mt-2 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              Kutilayotgan takliflar
            </div>
            <ul className="space-y-1.5">
              {pendingForBoard.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {inv.inviteeEmail}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(inv.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => cancelInvitation(inv.id)}
                    aria-label="Taklifni bekor qilish"
                  >
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
