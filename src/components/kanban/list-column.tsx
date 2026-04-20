"use client";

import { useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { MoreHorizontal, Plus, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
  const [adding, setAdding] = useState(false);
  const [newCard, setNewCard] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const setListColor = useDataStore((s) => s.setListColor);
  const createCard = useDataStore((s) => s.createCard);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const board = useDataStore((s) => s.boards.find((b) => b.id === list.boardId));

  const isAdmin = board?.createdBy === currentUserId;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-list-${list.id}`,
    data: { type: "list-drop", listId: list.id },
  });

  const colors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
    "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
  ];

  const handleAdd = () => {
    if (!newCard.trim() || !currentUserId) return;
    createCard(list.id, list.boardId, newCard, currentUserId);
    setNewCard("");
  };

  return (
    <div
      className={cn(
        "flex w-80 shrink-0 flex-col rounded-2xl border border-white/10 bg-background/80 backdrop-blur-md transition",
        list.color && "border-2",
      )}
      style={list.color ? { borderColor: list.color } : undefined}
    >
      <div className="flex items-center gap-1 p-2">
        <div className="flex-1 truncate px-2 py-1 text-sm font-semibold">
          {list.name}
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {cards.length}
        </span>
        {isAdmin && (
          <DropdownMenu open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <DropdownMenuTrigger
              render={
                <Button size="icon" variant="ghost" className="size-7">
                  <Palette className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <div className="grid grid-cols-5 gap-1 p-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setListColor(list.id, list.color === color ? "" : color);
                      setColorPickerOpen(false);
                    }}
                    className={cn(
                      "h-6 w-6 rounded-full transition hover:scale-110",
                      list.color === color && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Set color ${color}`}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div
        ref={setDropRef}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto scrollbar-thin px-2 pb-2",
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
