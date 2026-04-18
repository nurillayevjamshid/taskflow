"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  CheckSquare,
  Tag,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MemberPicker } from "@/components/member-picker";
import { UserAvatar } from "@/components/user-avatar";
import { LABEL_COLORS } from "@/lib/backgrounds";
import type { LabelColor } from "@/lib/types";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

interface Props {
  cardId: string | null;
  open: boolean;
  onClose: () => void;
}

export function CardDialog({ cardId, open, onClose }: Props) {
  const card = useDataStore((s) => s.cards.find((c) => c.id === cardId));
  const list = useDataStore((s) =>
    card ? s.lists.find((l) => l.id === card.listId) : undefined,
  );
  const board = useDataStore((s) =>
    card ? s.boards.find((b) => b.id === card.boardId) : undefined,
  );
  const users = useDataStore((s) => s.users);
  const comments = useDataStore((s) =>
    s.comments
      .filter((cm) => cm.cardId === cardId)
      .sort((a, b) => b.createdAt - a.createdAt),
  );
  const updateCard = useDataStore((s) => s.updateCard);
  const deleteCard = useDataStore((s) => s.deleteCard);
  const toggleCardMember = useDataStore((s) => s.toggleCardMember);
  const addCardLabel = useDataStore((s) => s.addCardLabel);
  const removeCardLabel = useDataStore((s) => s.removeCardLabel);
  const addComment = useDataStore((s) => s.addComment);
  const deleteComment = useDataStore((s) => s.deleteComment);
  const currentUserId = useAuthStore((s) => s.currentUserId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (card) {
      // Sync local editable fields when the dialog opens for a different card.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(card.title);
      setDescription(card.description ?? "");
    }
  }, [card]);

  const boardMembers = useMemo(
    () => (board ? users.filter((u) => board.memberIds.includes(u.id)) : []),
    [users, board],
  );

  if (!card) return null;

  const saveTitle = () => {
    if (title.trim() && title !== card.title) updateCard(card.id, { title: title.trim() });
  };
  const saveDescription = () => {
    if (description !== (card.description ?? ""))
      updateCard(card.id, { description: description.trim() || undefined });
  };

  const handleDelete = () => {
    if (confirm("Bu kartani o'chirib tashlamoqchimisiz?")) {
      deleteCard(card.id);
      onClose();
    }
  };

  const assignedMembers = users.filter((u) => card.memberIds.includes(u.id));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl scrollbar-thin">
        <DialogHeader className="pr-8">
          <div className="text-xs text-muted-foreground">
            {list?.name} ustunida
          </div>
          <DialogTitle>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="h-auto border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:bg-muted focus-visible:px-2"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-[1fr_220px]">
          <div className="space-y-6">
            <section>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Users className="size-4" />
                A&apos;zolar
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {assignedMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-2"
                  >
                    <UserAvatar user={m} size="xs" />
                    <span className="text-xs font-medium">{m.name}</span>
                    <button
                      onClick={() => toggleCardMember(card.id, m.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`${m.name} ni olib tashlash`}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <MemberPicker
                  allUsers={boardMembers}
                  selectedIds={card.memberIds}
                  onToggle={(uid) => toggleCardMember(card.id, uid)}
                  title="Karta a'zolari"
                  trigger={
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <UserPlus className="size-3.5" />
                      Biriktirish
                    </Button>
                  }
                />
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Tag className="size-4" />
                Yorliqlar
              </div>
              <div className="flex flex-wrap gap-2">
                {card.labels.map((l) => {
                  const color = LABEL_COLORS[l.color];
                  return (
                    <span
                      key={l.id}
                      className="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: color.bg, color: color.fg }}
                    >
                      {l.name}
                      <button
                        onClick={() => removeCardLabel(card.id, l.id)}
                        className="opacity-70 transition hover:opacity-100"
                        aria-label="Yorliqni o'chirish"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  );
                })}
                <AddLabel cardId={card.id} onAdd={addCardLabel} />
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="size-4" />
                Muddat
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-auto"
                  value={
                    card.dueDate
                      ? format(new Date(card.dueDate), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    updateCard(card.id, {
                      dueDate: v ? new Date(v).getTime() : null,
                    });
                  }}
                />
                {card.dueDate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateCard(card.id, { dueDate: null })}
                  >
                    Tozalash
                  </Button>
                )}
                <label className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!!card.completed}
                    onChange={(e) =>
                      updateCard(card.id, { completed: e.target.checked })
                    }
                    className="size-4 accent-primary"
                  />
                  Bajarildi
                </label>
              </div>
            </section>

            <section>
              <UILabel htmlFor="desc" className="text-sm font-semibold">
                Tavsif
              </UILabel>
              <Textarea
                id="desc"
                rows={5}
                className="mt-2"
                placeholder="Kartaga kontekst, havola yoki eslatma qo'shing…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
              />
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <CheckSquare className="size-4" />
                Izohlar
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commentText.trim() || !currentUserId) return;
                  addComment(card.id, currentUserId, commentText);
                  setCommentText("");
                }}
                className="flex items-start gap-2"
              >
                <Textarea
                  rows={2}
                  placeholder="Izoh yozing…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      (e.currentTarget.form as HTMLFormElement).requestSubmit();
                    }
                  }}
                />
                <Button type="submit" disabled={!commentText.trim()}>
                  Yuborish
                </Button>
              </form>
              <div className="mt-4 space-y-3">
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Hali izohlar yo&apos;q.
                  </p>
                )}
                {comments.map((cm) => {
                  const author = users.find((u) => u.id === cm.userId);
                  return (
                    <div key={cm.id} className="flex gap-3">
                      <UserAvatar user={author} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">
                            {author?.name ?? "Noma'lum"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(cm.createdAt, "dd MMM, HH:mm")}
                          </span>
                          {cm.userId === currentUserId && (
                            <button
                              onClick={() => deleteComment(cm.id)}
                              className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                            >
                              O&apos;chirish
                            </button>
                          )}
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm">
                          {cm.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Qo&apos;shilgan:{" "}
              <span className="font-medium text-foreground">
                {format(card.createdAt, "dd MMM yyyy")}
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
              Kartani o&apos;chirish
            </Button>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddLabel({
  cardId,
  onAdd,
}: {
  cardId: string;
  onAdd: (cardId: string, label: { name: string; color: LabelColor }) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<LabelColor>("violet");
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button size="sm" variant="outline" className="gap-1">
            <Tag className="size-3.5" />
            Qo&apos;shish
          </Button>
        }
      />
      <PopoverContent className="w-64 p-3">
        <div className="text-sm font-semibold">Yangi yorliq</div>
        <div className="mt-2 space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nomi"
          />
          <div className="grid grid-cols-7 gap-1.5">
            {(Object.keys(LABEL_COLORS) as LabelColor[]).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "h-7 rounded-md border transition",
                  color === c
                    ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                    : "border-border",
                )}
                style={{ background: LABEL_COLORS[c].bg }}
                aria-label={LABEL_COLORS[c].name}
              />
            ))}
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={!name.trim()}
            onClick={() => {
              onAdd(cardId, { name: name.trim(), color });
              setName("");
              setOpen(false);
            }}
          >
            Qo&apos;shish
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
