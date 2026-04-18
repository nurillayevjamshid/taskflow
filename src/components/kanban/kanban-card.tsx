"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, CheckCircle2, MessageSquare } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import type { Card } from "@/lib/types";
import { LABEL_COLORS } from "@/lib/backgrounds";
import { useDataStore } from "@/store/data-store";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export function KanbanCard({
  card,
  onOpen,
}: {
  card: Card;
  onOpen: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", listId: card.listId },
  });

  const users = useDataStore((s) => s.users);
  const commentCount = useDataStore(
    (s) => s.comments.filter((c) => c.cardId === card.id).length,
  );
  const members = users.filter((u) => card.memberIds.includes(u.id));
  const overdue =
    !!card.dueDate && isPast(card.dueDate) && !isToday(card.dueDate) && !card.completed;
  const soon = !!card.dueDate && isToday(card.dueDate);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative cursor-grab touch-none rounded-xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50",
        card.completed && "opacity-75",
      )}
      onDoubleClick={() => onOpen(card.id)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-card-click]") !== null) return;
        onOpen(card.id);
      }}
    >
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((l) => {
            const color = LABEL_COLORS[l.color];
            return (
              <span
                key={l.id}
                className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold"
                style={{ background: color.bg, color: color.fg }}
              >
                {l.name}
              </span>
            );
          })}
        </div>
      )}
      <div
        className={cn(
          "text-sm font-medium leading-snug",
          card.completed && "line-through text-muted-foreground",
        )}
      >
        {card.title}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        {card.dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
              overdue
                ? "bg-destructive/15 text-destructive"
                : soon
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "",
            )}
          >
            {card.completed ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <CalendarClock className="size-3.5" />
            )}
            {format(card.dueDate, "d MMM")}
          </span>
        )}
        {commentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {commentCount}
          </span>
        )}
        {members.length > 0 && (
          <div className="ml-auto flex -space-x-1.5">
            {members.slice(0, 3).map((m) => (
              <UserAvatar key={m.id} user={m} size="xs" ring />
            ))}
            {members.length > 3 && (
              <span className="grid size-6 place-items-center rounded-full border-2 border-background bg-muted text-[9px] font-medium">
                +{members.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
