"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, CheckCircle2, MessageSquare, AlignLeft } from "lucide-react";
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

  const hasDescription = !!card.description;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative cursor-grab touch-none rounded-lg border border-border bg-white p-2 shadow-sm transition hover:border-primary/30 hover:shadow active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2",
        card.completed && "opacity-75",
      )}
      onDoubleClick={() => onOpen(card.id)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-card-click]") !== null) return;
        onOpen(card.id);
      }}
    >
      {card.labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {card.labels.map((l) => {
            const color = LABEL_COLORS[l.color];
            return (
              <span
                key={l.id}
                className="inline-flex h-4 items-center rounded px-1.5 text-[10px] font-medium"
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
          "text-sm leading-tight",
          card.completed && "line-through text-muted-foreground",
        )}
      >
        {card.title}
      </div>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {card.dueDate && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
              overdue
                ? "bg-red-100 text-red-700"
                : soon
                  ? "bg-amber-100 text-amber-700"
                  : card.completed
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-700",
            )}
          >
            {card.completed ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <CalendarClock className="size-3" />
            )}
            {format(card.dueDate, "d MMM")}
          </span>
        )}
        {hasDescription && (
          <span className="text-slate-400">
            <AlignLeft className="size-3.5" />
          </span>
        )}
        {commentCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
            <MessageSquare className="size-3" />
            {commentCount}
          </span>
        )}
        {members.length > 0 && (
          <div className="ml-auto flex -space-x-1">
            {members.slice(0, 2).map((m) => (
              <UserAvatar key={m.id} user={m} size="xs" ring />
            ))}
            {members.length > 2 && (
              <span className="grid size-5 place-items-center rounded-full border border-white bg-slate-200 text-[9px] font-medium text-slate-600">
                +{members.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
