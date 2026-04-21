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
        "flex max-h-[calc(100vh-180px)] w-72 shrink-0 flex-col rounded-xl bg-slate-100/90 shadow-sm transition",
        list.color && "ring-2 ring-offset-2",
      )}
      style={list.color ? { "--tw-ring-color": list.color } as React.CSSProperties : undefined}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex-1 truncate text-sm font-semibold text-slate-800">
          {list.name}
        </div>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {cards.length}
        </span>
        {isAdmin && (
          <DropdownMenu open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
            <DropdownMenuTrigger
              render={
                <Button size="icon" variant="ghost" className="size-7 hover:bg-slate-200">
                  <Palette className="size-4 text-slate-500" />
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
          "flex min-h-[60px] flex-col gap-1.5 overflow-y-auto px-2 py-1",
          isOver && "bg-slate-200/50 rounded-lg",
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

      <div className="px-2 pb-2 pt-0">
        {adding ? (
          <div className="rounded-lg border border-slate-300 bg-white p-2 shadow-sm">
            <Textarea
              autoFocus
              rows={2}
              value={newCard}
              onChange={(e) => setNewCard(e.target.value)}
              placeholder="Karta sarlavhasi"
              className="mb-2 resize-none border-0 p-0 text-sm focus-visible:ring-0"
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
                className="h-7 text-xs"
              >
                Karta qo'shish
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
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
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-200/70"
          >
            <Plus className="size-4" />
            Karta qo'shish
          </button>
        )}
      </div>
    </div>
  );
}
