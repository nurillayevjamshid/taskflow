"use client";

import { useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { MoreHorizontal, Plus, Trash2, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KanbanCard } from "./kanban-card";
import type { Card, List } from "@/lib/types";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

interface Props {
  list: List;
  cards: Card[];
  onOpenCard: (id: string) => void;
}

export function ListColumn({ list, cards, onOpenCard }: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.name);
  const [adding, setAdding] = useState(false);
  const [newCard, setNewCard] = useState("");

  const updateList = useDataStore((s) => s.updateList);
  const deleteList = useDataStore((s) => s.deleteList);
  const createCard = useDataStore((s) => s.createCard);
  const currentUserId = useAuthStore((s) => s.currentUserId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id, data: { type: "list" } });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-list-${list.id}`,
    data: { type: "list-drop", listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const saveTitle = () => {
    if (title.trim() && title !== list.name) updateList(list.id, { name: title.trim() });
    else setTitle(list.name);
    setEditingTitle(false);
  };

  const handleAdd = () => {
    if (!newCard.trim() || !currentUserId) return;
    createCard(list.id, list.boardId, newCard, currentUserId);
    setNewCard("");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex w-80 shrink-0 flex-col rounded-2xl border border-white/10 bg-background/80 backdrop-blur-md transition",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          {...attributes}
          {...listeners}
          className="grid size-7 shrink-0 cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          aria-label="Ustunni ko'chirish"
        >
          <GripVertical className="size-4" />
        </button>
        {editingTitle ? (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setTitle(list.name);
                setEditingTitle(false);
              }
            }}
            className="h-8 text-sm font-semibold"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex-1 truncate rounded-md px-2 py-1 text-left text-sm font-semibold hover:bg-muted"
          >
            {list.name}
          </button>
        )}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {cards.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="ghost" className="size-7">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setEditingTitle(true)}
              className="cursor-pointer"
            >
              Nomini o&apos;zgartirish
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (confirm("Bu ustun va uning kartalarini o'chirasizmi?"))
                  deleteList(list.id);
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              Ustunni o&apos;chirish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={setDropRef}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto scrollbar-thin px-2 pb-2 min-h-20",
          isOver && "bg-primary/5 rounded-lg",
        )}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((c) => (
            <KanbanCard key={c.id} card={c} onOpen={onOpenCard} />
          ))}
        </SortableContext>
      </div>

      <div className="p-2">
        {adding ? (
          <div className="rounded-xl border border-border bg-card p-2">
            <Textarea
              autoFocus
              rows={2}
              value={newCard}
              onChange={(e) => setNewCard(e.target.value)}
              placeholder="Karta sarlavhasi"
              className="mb-2 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewCard("");
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!newCard.trim()}
              >
                Qo&apos;shish
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdding(false);
                  setNewCard("");
                }}
              >
                Bekor
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-4" />
            Karta qo&apos;shish
          </button>
        )}
      </div>
    </div>
  );
}
