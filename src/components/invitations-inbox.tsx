"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Check, Inbox, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/store/data-store";
import { cn } from "@/lib/utils";

interface Props {
  /** Optional styling hook for dark (on-board) headers. */
  variant?: "default" | "onDark";
}

export function InvitationsInbox({ variant = "default" }: Props) {
  const router = useRouter();
  const invitations = useDataStore((s) => s.invitations);
  const acceptInvitation = useDataStore((s) => s.acceptInvitation);
  const declineInvitation = useDataStore((s) => s.declineInvitation);

  const pending = invitations.filter((i) => i.status === "pending");

  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleAccept = async (id: string, boardId: string) => {
    setBusyId(id);
    try {
      await acceptInvitation(id);
      toast.success("Taklif qabul qilindi");
      setOpen(false);
      router.push(`/b?id=${boardId}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Qabul qilishda xatolik";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setBusyId(id);
    try {
      await declineInvitation(id);
      toast.success("Taklif rad etildi");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Rad etishda xatolik";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const onDark = variant === "onDark";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "relative",
              onDark && "text-white hover:bg-white/15 hover:text-white",
            )}
            aria-label={`Takliflar${pending.length > 0 ? ` (${pending.length})` : ""}`}
          />
        }
      >
        <Bell className="size-4" />
        {pending.length > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold leading-none",
              "bg-destructive text-destructive-foreground",
              "h-4",
            )}
          >
            {pending.length > 9 ? "9+" : pending.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center gap-2 border-b border-border p-3">
          <Inbox className="size-4" />
          <div className="text-sm font-semibold">Takliflar</div>
          {pending.length > 0 && (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {pending.length} kutilmoqda
            </span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="size-5 opacity-50" />
              Hozircha yangi taklif yo&apos;q
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((inv) => {
                const busy = busyId === inv.id;
                return (
                  <li key={inv.id} className="p-3">
                    <div className="text-sm">
                      <span className="font-semibold">{inv.inviterName}</span>{" "}
                      sizni{" "}
                      <span className="font-semibold">“{inv.boardName}”</span>{" "}
                      doskasiga taklif qildi.
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {inv.inviterEmail} ·{" "}
                      {formatDistanceToNow(inv.createdAt, { addSuffix: true })}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={busy}
                        onClick={() => handleAccept(inv.id, inv.boardId)}
                      >
                        <Check className="size-3.5" />
                        Qabul qilish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={busy}
                        onClick={() => handleDecline(inv.id)}
                      >
                        <X className="size-3.5" />
                        Rad etish
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
