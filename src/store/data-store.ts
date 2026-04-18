"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Board,
  BoardBackground,
  Card,
  Comment,
  Label,
  List,
  User,
  Workspace,
} from "@/lib/types";
import { makeId } from "@/lib/hash";
import { STORAGE_KEY } from "@/lib/storage";
import { buildDemoSeed, buildStarterContent } from "@/lib/seed";

interface DataState {
  users: User[];
  workspaces: Workspace[];
  boards: Board[];
  lists: List[];
  cards: Card[];
  comments: Comment[];
  seeded: boolean;

  // hydration flag
  hydrated: boolean;
  markHydrated: () => void;

  // seeding
  seed: () => void;
  ensureStarterContent: (userId: string) => void;

  // users
  addUser: (user: User) => void;

  // workspaces
  createWorkspace: (
    name: string,
    description: string,
    ownerId: string,
  ) => Workspace;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  addWorkspaceMember: (workspaceId: string, userId: string) => void;
  removeWorkspaceMember: (workspaceId: string, userId: string) => void;

  // boards
  createBoard: (
    workspaceId: string,
    name: string,
    background: BoardBackground,
    createdBy: string,
  ) => Board;
  updateBoard: (id: string, patch: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  toggleStar: (id: string) => void;
  addBoardMember: (boardId: string, userId: string) => void;
  removeBoardMember: (boardId: string, userId: string) => void;

  // lists
  createList: (boardId: string, name: string) => List;
  updateList: (id: string, patch: Partial<List>) => void;
  deleteList: (id: string) => void;
  reorderLists: (boardId: string, orderedIds: string[]) => void;

  // cards
  createCard: (
    listId: string,
    boardId: string,
    title: string,
    createdBy: string,
  ) => Card;
  updateCard: (id: string, patch: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (
    cardId: string,
    targetListId: string,
    targetIndex: number,
  ) => void;
  reorderCards: (listId: string, orderedIds: string[]) => void;
  addCardLabel: (cardId: string, label: Omit<Label, "id">) => void;
  removeCardLabel: (cardId: string, labelId: string) => void;
  toggleCardMember: (cardId: string, userId: string) => void;

  // comments
  addComment: (cardId: string, userId: string, text: string) => Comment;
  deleteComment: (commentId: string) => void;
}

const initial = {
  users: [] as User[],
  workspaces: [] as Workspace[],
  boards: [] as Board[],
  lists: [] as List[],
  cards: [] as Card[],
  comments: [] as Comment[],
  seeded: false,
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),

      seed: () => {
        if (get().seeded) return;
        const s = buildDemoSeed();
        set({
          users: [...s.users, ...get().users],
          seeded: true,
        });
      },

      ensureStarterContent: (userId) => {
        const state = get();
        const alreadyHasWorkspace = state.workspaces.some(
          (w) => w.ownerId === userId,
        );
        if (alreadyHasWorkspace) return;
        const starter = buildStarterContent(userId);
        set({
          workspaces: [...state.workspaces, starter.workspace],
          boards: [...state.boards, starter.board],
          lists: [...state.lists, ...starter.lists],
          cards: [...state.cards, ...starter.cards],
        });
      },

      addUser: (user) => set({ users: [...get().users, user] }),

      createWorkspace: (name, description, ownerId) => {
        const w: Workspace = {
          id: "w_" + makeId(),
          name: name.trim(),
          description: description.trim() || undefined,
          ownerId,
          memberIds: [ownerId],
          createdAt: Date.now(),
        };
        set({ workspaces: [...get().workspaces, w] });
        return w;
      },
      updateWorkspace: (id, patch) =>
        set({
          workspaces: get().workspaces.map((w) =>
            w.id === id ? { ...w, ...patch } : w,
          ),
        }),
      deleteWorkspace: (id) => {
        const { workspaces, boards, lists, cards, comments } = get();
        const boardIds = boards
          .filter((b) => b.workspaceId === id)
          .map((b) => b.id);
        const listIds = lists
          .filter((l) => boardIds.includes(l.boardId))
          .map((l) => l.id);
        const cardIds = cards
          .filter((c) => listIds.includes(c.listId))
          .map((c) => c.id);
        set({
          workspaces: workspaces.filter((w) => w.id !== id),
          boards: boards.filter((b) => !boardIds.includes(b.id)),
          lists: lists.filter((l) => !listIds.includes(l.id)),
          cards: cards.filter((c) => !cardIds.includes(c.id)),
          comments: comments.filter((cm) => !cardIds.includes(cm.cardId)),
        });
      },
      addWorkspaceMember: (workspaceId, userId) =>
        set({
          workspaces: get().workspaces.map((w) =>
            w.id === workspaceId && !w.memberIds.includes(userId)
              ? { ...w, memberIds: [...w.memberIds, userId] }
              : w,
          ),
        }),
      removeWorkspaceMember: (workspaceId, userId) =>
        set({
          workspaces: get().workspaces.map((w) =>
            w.id === workspaceId
              ? { ...w, memberIds: w.memberIds.filter((m) => m !== userId) }
              : w,
          ),
        }),

      createBoard: (workspaceId, name, background, createdBy) => {
        const b: Board = {
          id: "b_" + makeId(),
          workspaceId,
          name: name.trim(),
          background,
          memberIds: [createdBy],
          createdBy,
          createdAt: Date.now(),
        };
        set({ boards: [...get().boards, b] });
        // create 3 default lists
        const now = Date.now();
        const defaults: List[] = [
          {
            id: "l_" + makeId(),
            boardId: b.id,
            name: "Rejada",
            position: 0,
            createdAt: now,
          },
          {
            id: "l_" + makeId(),
            boardId: b.id,
            name: "Jarayonda",
            position: 1,
            createdAt: now,
          },
          {
            id: "l_" + makeId(),
            boardId: b.id,
            name: "Bajarildi",
            position: 2,
            createdAt: now,
          },
        ];
        set({ lists: [...get().lists, ...defaults] });
        return b;
      },
      updateBoard: (id, patch) =>
        set({
          boards: get().boards.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
        }),
      deleteBoard: (id) => {
        const { boards, lists, cards, comments } = get();
        const listIds = lists.filter((l) => l.boardId === id).map((l) => l.id);
        const cardIds = cards
          .filter((c) => listIds.includes(c.listId))
          .map((c) => c.id);
        set({
          boards: boards.filter((b) => b.id !== id),
          lists: lists.filter((l) => l.boardId !== id),
          cards: cards.filter((c) => !listIds.includes(c.listId)),
          comments: comments.filter((cm) => !cardIds.includes(cm.cardId)),
        });
      },
      toggleStar: (id) =>
        set({
          boards: get().boards.map((b) =>
            b.id === id ? { ...b, starred: !b.starred } : b,
          ),
        }),
      addBoardMember: (boardId, userId) =>
        set({
          boards: get().boards.map((b) =>
            b.id === boardId && !b.memberIds.includes(userId)
              ? { ...b, memberIds: [...b.memberIds, userId] }
              : b,
          ),
        }),
      removeBoardMember: (boardId, userId) =>
        set({
          boards: get().boards.map((b) =>
            b.id === boardId
              ? { ...b, memberIds: b.memberIds.filter((m) => m !== userId) }
              : b,
          ),
        }),

      createList: (boardId, name) => {
        const existing = get().lists.filter((l) => l.boardId === boardId);
        const l: List = {
          id: "l_" + makeId(),
          boardId,
          name: name.trim() || "Yangi ustun",
          position: existing.length,
          createdAt: Date.now(),
        };
        set({ lists: [...get().lists, l] });
        return l;
      },
      updateList: (id, patch) =>
        set({
          lists: get().lists.map((l) =>
            l.id === id ? { ...l, ...patch } : l,
          ),
        }),
      deleteList: (id) => {
        const { lists, cards, comments } = get();
        const cardIds = cards.filter((c) => c.listId === id).map((c) => c.id);
        set({
          lists: lists.filter((l) => l.id !== id),
          cards: cards.filter((c) => c.listId !== id),
          comments: comments.filter((cm) => !cardIds.includes(cm.cardId)),
        });
      },
      reorderLists: (boardId, orderedIds) => {
        const pos = new Map(orderedIds.map((id, idx) => [id, idx]));
        set({
          lists: get().lists.map((l) =>
            l.boardId === boardId && pos.has(l.id)
              ? { ...l, position: pos.get(l.id)! }
              : l,
          ),
        });
      },

      createCard: (listId, boardId, title, createdBy) => {
        const existing = get().cards.filter((c) => c.listId === listId);
        const c: Card = {
          id: "c_" + makeId(),
          listId,
          boardId,
          title: title.trim() || "Yangi karta",
          position: existing.length,
          labels: [],
          memberIds: [],
          createdBy,
          createdAt: Date.now(),
        };
        set({ cards: [...get().cards, c] });
        return c;
      },
      updateCard: (id, patch) =>
        set({
          cards: get().cards.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        }),
      deleteCard: (id) => {
        const { cards, comments } = get();
        set({
          cards: cards.filter((c) => c.id !== id),
          comments: comments.filter((cm) => cm.cardId !== id),
        });
      },
      moveCard: (cardId, targetListId, targetIndex) => {
        const { cards } = get();
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;

        const sourceListId = card.listId;
        const sourceCards = cards
          .filter((c) => c.listId === sourceListId && c.id !== cardId)
          .sort((a, b) => a.position - b.position);

        const targetCards =
          sourceListId === targetListId
            ? sourceCards
            : cards
                .filter((c) => c.listId === targetListId)
                .sort((a, b) => a.position - b.position);

        const clamped = Math.max(0, Math.min(targetIndex, targetCards.length));
        const newTargetCards = [...targetCards];
        newTargetCards.splice(clamped, 0, { ...card, listId: targetListId });

        const updates = new Map<string, Partial<Card>>();
        newTargetCards.forEach((c, idx) => {
          updates.set(c.id, {
            listId: targetListId,
            position: idx,
          });
        });
        if (sourceListId !== targetListId) {
          sourceCards.forEach((c, idx) => {
            updates.set(c.id, { listId: sourceListId, position: idx });
          });
        }

        set({
          cards: cards.map((c) =>
            updates.has(c.id) ? { ...c, ...updates.get(c.id)! } : c,
          ),
        });
      },
      reorderCards: (listId, orderedIds) => {
        const pos = new Map(orderedIds.map((id, idx) => [id, idx]));
        set({
          cards: get().cards.map((c) =>
            c.listId === listId && pos.has(c.id)
              ? { ...c, position: pos.get(c.id)! }
              : c,
          ),
        });
      },
      addCardLabel: (cardId, label) =>
        set({
          cards: get().cards.map((c) =>
            c.id === cardId
              ? { ...c, labels: [...c.labels, { ...label, id: makeId() }] }
              : c,
          ),
        }),
      removeCardLabel: (cardId, labelId) =>
        set({
          cards: get().cards.map((c) =>
            c.id === cardId
              ? { ...c, labels: c.labels.filter((l) => l.id !== labelId) }
              : c,
          ),
        }),
      toggleCardMember: (cardId, userId) =>
        set({
          cards: get().cards.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  memberIds: c.memberIds.includes(userId)
                    ? c.memberIds.filter((m) => m !== userId)
                    : [...c.memberIds, userId],
                }
              : c,
          ),
        }),

      addComment: (cardId, userId, text) => {
        const cm: Comment = {
          id: "cm_" + makeId(),
          cardId,
          userId,
          text: text.trim(),
          createdAt: Date.now(),
        };
        set({ comments: [...get().comments, cm] });
        return cm;
      },
      deleteComment: (commentId) =>
        set({ comments: get().comments.filter((cm) => cm.id !== commentId) }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        users: s.users,
        workspaces: s.workspaces,
        boards: s.boards,
        lists: s.lists,
        cards: s.cards,
        comments: s.comments,
        seeded: s.seeded,
      }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
