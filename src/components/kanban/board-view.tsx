"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { ListColumn } from "./list-column";
import { KanbanCard } from "./kanban-card";
import { CardDialog } from "./card-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Card } from "@/lib/types";
import { useDataStore } from "@/store/data-store";

interface Props {
  boardId: string;
}

export function BoardView({ boardId }: Props) {
  const allLists = useDataStore((s) => s.lists);
  const allCards = useDataStore((s) => s.cards);
  const reorderLists = useDataStore((s) => s.reorderLists);
  const moveCard = useDataStore((s) => s.moveCard);
  const createList = useDataStore((s) => s.createList);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const lists = useMemo(
    () =>
      allLists
        .filter((l) => l.boardId === boardId)
        .sort((a, b) => a.position - b.position),
    [allLists, boardId],
  );

  const cardsByList = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const l of lists) map.set(l.id, []);
    for (const c of allCards) {
      if (!map.has(c.listId)) continue;
      map.get(c.listId)!.push(c);
    }
    for (const [k, arr] of map.entries()) {
      map.set(
        k,
        arr.sort((a, b) => a.position - b.position),
      );
    }
    return map;
  }, [allCards, lists]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeCard = activeId ? allCards.find((c) => c.id === activeId) : null;
  const activeList = activeId ? lists.find((l) => l.id === activeId) : null;

  const findContainerForItem = (id: string): string | null => {
    if (lists.some((l) => l.id === id)) return null;
    const card = allCards.find((c) => c.id === id);
    return card ? card.listId : null;
  };

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    const isActiveCard = active.data.current?.type === "card";
    if (!isActiveCard) return;

    const sourceListId = findContainerForItem(activeIdStr);
    if (!sourceListId) return;

    // Determine target list
    let targetListId: string | null = null;
    if (over.data.current?.type === "list-drop") {
      targetListId = over.data.current.listId as string;
    } else if (over.data.current?.type === "card") {
      targetListId = over.data.current.listId as string;
    } else if (lists.some((l) => l.id === overIdStr)) {
      targetListId = overIdStr;
    }
    if (!targetListId) return;

    if (sourceListId === targetListId) return;

    // Move to end of target list (position 99999 -> will be clamped)
    moveCard(activeIdStr, targetListId, 99999);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    // list reordering
    if (
      active.data.current?.type === "list" &&
      over.data.current?.type === "list"
    ) {
      const oldIndex = lists.findIndex((l) => l.id === activeIdStr);
      const newIndex = lists.findIndex((l) => l.id === overIdStr);
      if (oldIndex >= 0 && newIndex >= 0) {
        const newOrder = arrayMove(lists, oldIndex, newIndex);
        reorderLists(
          boardId,
          newOrder.map((l) => l.id),
        );
      }
      return;
    }

    if (active.data.current?.type === "card") {
      const sourceListId = findContainerForItem(activeIdStr);
      let targetListId: string | null = null;
      let targetIndex = 0;

      if (over.data.current?.type === "card") {
        targetListId = over.data.current.listId as string;
        const targetCards = cardsByList.get(targetListId) ?? [];
        targetIndex = targetCards.findIndex((c) => c.id === overIdStr);
        if (targetIndex < 0) targetIndex = targetCards.length;
      } else if (over.data.current?.type === "list-drop") {
        targetListId = over.data.current.listId as string;
        targetIndex = (cardsByList.get(targetListId) ?? []).length;
      } else if (lists.some((l) => l.id === overIdStr)) {
        targetListId = overIdStr;
        targetIndex = (cardsByList.get(targetListId) ?? []).length;
      }

      if (!targetListId || !sourceListId) return;
      moveCard(activeIdStr, targetListId, targetIndex);
    }
  };

  const handleAddList = () => {
    if (!newListName.trim()) return;
    createList(boardId, newListName);
    setNewListName("");
    setAddingList(false);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto scrollbar-thin px-4 pb-6 sm:px-6">
          <SortableContext
            items={lists.map((l) => l.id)}
            strategy={horizontalListSortingStrategy}
          >
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                cards={cardsByList.get(list.id) ?? []}
                onOpenCard={setOpenCardId}
              />
            ))}
          </SortableContext>

          <div className="shrink-0">
            {addingList ? (
              <div className="w-80 rounded-2xl border border-white/10 bg-background/80 p-2 backdrop-blur-md">
                <Input
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ustun nomi"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList();
                    if (e.key === "Escape") {
                      setAddingList(false);
                      setNewListName("");
                    }
                  }}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddList} disabled={!newListName.trim()}>
                    Qo&apos;shish
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingList(false);
                      setNewListName("");
                    }}
                  >
                    Bekor
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingList(true)}
                className="flex h-11 w-80 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 bg-white/5 px-4 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/15"
              >
                <Plus className="size-4" />
                Ustun qo&apos;shish
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-72 rotate-2">
              <KanbanCard card={activeCard} onOpen={() => {}} />
            </div>
          ) : activeList ? (
            <div className="w-80 rotate-1 opacity-95">
              <ListColumn
                list={activeList}
                cards={cardsByList.get(activeList.id) ?? []}
                onOpenCard={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardDialog
        cardId={openCardId}
        open={openCardId !== null}
        onClose={() => setOpenCardId(null)}
      />
    </>
  );
}
