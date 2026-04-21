"use client";

import { useEffect, useMemo, useState } from "react";
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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ListColumn } from "./list-column";
import { KanbanCard } from "./kanban-card";
import { CardDialog } from "./card-dialog";
import type { Card } from "@/lib/types";
import { useDataStore } from "@/store/data-store";

interface Props {
  boardId: string;
}

export function BoardView({ boardId }: Props) {
  const allLists = useDataStore((s) => s.lists);
  const allCards = useDataStore((s) => s.cards);
  const moveCard = useDataStore((s) => s.moveCard);
  const migrateBoard = useDataStore((s) => s.migrateBoard);
  const reconcileCards = useDataStore((s) => s.reconcileCards);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);

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

  // Migrate old boards to new 5-column structure
  useEffect(() => {
    migrateBoard(boardId);
  }, [boardId, migrateBoard]);

  // Auto-reconcile cards every 30 seconds (startAt, dueDate checks)
  useEffect(() => {
    reconcileCards();
    const interval = setInterval(() => {
      reconcileCards();
    }, 30000);
    return () => clearInterval(interval);
  }, [reconcileCards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeCard = activeId ? allCards.find((c) => c.id === activeId) : null;

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

    // list reordering - DISABLED (columns are fixed)
    if (
      active.data.current?.type === "list" &&
      over.data.current?.type === "list"
    ) {
      // Columns are fixed, do not allow reordering
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

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-full gap-3 overflow-x-auto px-4 pb-4 pt-2">
          {lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              cards={cardsByList.get(list.id) ?? []}
              onOpenCard={setOpenCardId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-72 rotate-2">
              <KanbanCard card={activeCard} onOpen={() => {}} />
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
