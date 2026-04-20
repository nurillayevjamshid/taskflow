"use client";

import { create } from "zustand";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type {
  Board,
  BoardBackground,
  Card,
  Comment,
  Invitation,
  Label,
  List,
  User,
  Workspace,
} from "@/lib/types";
import { db } from "@/lib/firebase";
import { makeId } from "@/lib/hash";
import { useAuthStore } from "@/store/auth-store";

interface DataState {
  users: User[];
  workspaces: Workspace[];
  boards: Board[];
  lists: List[];
  cards: Card[];
  comments: Comment[];
  invitations: Invitation[];

  /** True once the global subscriptions (users/workspaces/boards) have delivered. */
  hydrated: boolean;

  /** Subscribe to users/workspaces/boards scoped to the signed-in user. */
  subscribeGlobal: (userId: string) => () => void;
  /** Subscribe to one board's lists/cards/comments subcollections. */
  subscribeBoard: (boardId: string) => () => void;
  /** Subscribe to invitations addressed to the signed-in user's email. */
  subscribeInvitations: (email: string) => () => void;
  /** Clear local state (on logout). */
  clear: () => void;

  // workspaces
  createWorkspace: (
    name: string,
    description: string,
    ownerId: string,
  ) => Promise<Workspace>;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  addWorkspaceMember: (workspaceId: string, userId: string) => Promise<void>;
  removeWorkspaceMember: (
    workspaceId: string,
    userId: string,
  ) => Promise<void>;

  // boards
  createBoard: (
    workspaceId: string,
    name: string,
    background: BoardBackground,
    createdBy: string,
  ) => Promise<Board>;
  updateBoard: (id: string, patch: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  addBoardMember: (boardId: string, userId: string) => Promise<void>;
  removeBoardMember: (boardId: string, userId: string) => Promise<void>;
  leaveBoard: (boardId: string, userId: string) => Promise<void>;
  migrateBoard: (boardId: string) => Promise<void>;

  // lists
  createList: (boardId: string, name: string) => Promise<List>;
  updateList: (id: string, patch: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  reorderLists: (boardId: string, orderedIds: string[]) => Promise<void>;
  setListColor: (listId: string, color: string) => Promise<void>;

  // cards
  createCard: (
    listId: string,
    boardId: string,
    title: string,
    createdBy: string,
  ) => Promise<Card>;
  updateCard: (id: string, patch: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (
    cardId: string,
    targetListId: string,
    targetIndex: number,
  ) => Promise<void>;
  reorderCards: (listId: string, orderedIds: string[]) => Promise<void>;
  addCardLabel: (cardId: string, label: Omit<Label, "id">) => Promise<void>;
  removeCardLabel: (cardId: string, labelId: string) => Promise<void>;
  toggleCardMember: (cardId: string, userId: string) => Promise<void>;
  sendCardToReview: (cardId: string) => Promise<void>;
  reconcileCards: () => Promise<void>;

  // comments
  addComment: (
    cardId: string,
    userId: string,
    text: string,
  ) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<void>;

  // invitations
  sendInvitation: (
    boardId: string,
    inviteeEmail: string,
    inviter: User,
  ) => Promise<Invitation>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
}

/** Deterministic invitation doc id — must match the Firestore rule. */
function invitationIdFor(boardId: string, email: string): string {
  return `${boardId}__${email.trim().toLowerCase()}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Track which boards we're subscribed to so we can ref-count and replace
// state slices correctly.
const boardSubscribers = new Map<string, number>();
const boardUnsubscribers = new Map<string, () => void>();

function findList(listId: string, lists: List[]): List | undefined {
  return lists.find((l) => l.id === listId);
}

function findCard(cardId: string, cards: Card[]): Card | undefined {
  return cards.find((c) => c.id === cardId);
}

function findComment(commentId: string, comments: Comment[]): Comment | undefined {
  return comments.find((c) => c.id === commentId);
}

export const useDataStore = create<DataState>()((set, get) => ({
  users: [],
  workspaces: [],
  boards: [],
  lists: [],
  cards: [],
  comments: [],
  invitations: [],
  hydrated: false,

  subscribeGlobal: (userId) => {
    const delivered = { users: false, workspaces: false, boards: false };
    const markReady = () => {
      if (delivered.users && delivered.workspaces && delivered.boards)
        set({ hydrated: true });
    };

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      set({ users: snap.docs.map((d) => d.data() as User) });
      delivered.users = true;
      markReady();
    });
    const unsubWorkspaces = onSnapshot(
      query(collection(db, "workspaces"), where("memberIds", "array-contains", userId)),
      (snap) => {
        set({ workspaces: snap.docs.map((d) => d.data() as Workspace) });
        delivered.workspaces = true;
        markReady();
      },
    );
    const unsubBoards = onSnapshot(
      query(collection(db, "boards"), where("memberIds", "array-contains", userId)),
      (snap) => {
        set({ boards: snap.docs.map((d) => d.data() as Board) });
        delivered.boards = true;
        markReady();
      },
    );

    return () => {
      unsubUsers();
      unsubWorkspaces();
      unsubBoards();
    };
  },

  subscribeBoard: (boardId) => {
    const prev = boardSubscribers.get(boardId) ?? 0;
    boardSubscribers.set(boardId, prev + 1);
    if (prev === 0) {
      const unsubLists = onSnapshot(
        collection(db, "boards", boardId, "lists"),
        (snap) => {
          const incoming = snap.docs.map((d) => d.data() as List);
          set((state) => ({
            lists: [
              ...state.lists.filter((l) => l.boardId !== boardId),
              ...incoming,
            ],
          }));
        },
      );
      const unsubCards = onSnapshot(
        collection(db, "boards", boardId, "cards"),
        (snap) => {
          const incoming = snap.docs.map((d) => d.data() as Card);
          set((state) => ({
            cards: [
              ...state.cards.filter((c) => c.boardId !== boardId),
              ...incoming,
            ],
          }));
        },
      );
      const unsubComments = onSnapshot(
        collection(db, "boards", boardId, "comments"),
        (snap) => {
          const incoming = snap.docs.map((d) => d.data() as Comment);
          // We need to know which comments belonged to this board before.
          // We tag all nested comments with their boardId in state via cards.
          const cardsInBoard = new Set(
            get().cards.filter((c) => c.boardId === boardId).map((c) => c.id),
          );
          set((state) => ({
            comments: [
              ...state.comments.filter((cm) => !cardsInBoard.has(cm.cardId)),
              ...incoming,
            ],
          }));
        },
      );
      boardUnsubscribers.set(boardId, () => {
        unsubLists();
        unsubCards();
        unsubComments();
      });
    }

    return () => {
      const current = (boardSubscribers.get(boardId) ?? 1) - 1;
      if (current <= 0) {
        boardSubscribers.delete(boardId);
        const unsub = boardUnsubscribers.get(boardId);
        if (unsub) {
          unsub();
          boardUnsubscribers.delete(boardId);
        }
        // Drop this board's nested state so we don't leak across sessions.
        set((state) => {
          const cardIds = new Set(
            state.cards.filter((c) => c.boardId === boardId).map((c) => c.id),
          );
          return {
            lists: state.lists.filter((l) => l.boardId !== boardId),
            cards: state.cards.filter((c) => c.boardId !== boardId),
            comments: state.comments.filter((cm) => !cardIds.has(cm.cardId)),
          };
        });
      } else {
        boardSubscribers.set(boardId, current);
      }
    };
  },

  subscribeInvitations: (email) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return () => {};
    const unsub = onSnapshot(
      query(
        collection(db, "invitations"),
        where("inviteeEmail", "==", normalized),
      ),
      (snap) => {
        set({ invitations: snap.docs.map((d) => d.data() as Invitation) });
      },
      () => {
        // Permission errors (e.g. during sign-out race) shouldn't crash.
      },
    );
    return unsub;
  },

  clear: () => {
    for (const unsub of boardUnsubscribers.values()) unsub();
    boardUnsubscribers.clear();
    boardSubscribers.clear();
    set({
      users: [],
      workspaces: [],
      boards: [],
      lists: [],
      cards: [],
      comments: [],
      invitations: [],
      hydrated: false,
    });
  },

  // ── workspaces ──────────────────────────────────────────────────────────────

  createWorkspace: async (name, description, ownerId) => {
    const w: Workspace = {
      id: "w_" + makeId(),
      name: name.trim(),
      description: description.trim() || undefined,
      ownerId,
      memberIds: [ownerId],
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "workspaces", w.id), w);
    return w;
  },
  updateWorkspace: async (id, patch) => {
    await updateDoc(doc(db, "workspaces", id), patch);
  },
  deleteWorkspace: async (id) => {
    const { boards } = get();
    const wsBoards = boards.filter((b) => b.workspaceId === id);
    for (const b of wsBoards) {
      await get().deleteBoard(b.id);
    }
    await deleteDoc(doc(db, "workspaces", id));
  },
  addWorkspaceMember: async (workspaceId, userId) => {
    await updateDoc(doc(db, "workspaces", workspaceId), {
      memberIds: arrayUnion(userId),
    });
  },
  removeWorkspaceMember: async (workspaceId, userId) => {
    await updateDoc(doc(db, "workspaces", workspaceId), {
      memberIds: arrayRemove(userId),
    });
  },

  // ── boards ──────────────────────────────────────────────────────────────────

  createBoard: async (workspaceId, name, background, createdBy) => {
    const b: Board = {
      id: "b_" + makeId(),
      workspaceId,
      name: name.trim(),
      background,
      memberIds: [createdBy],
      createdBy,
      createdAt: Date.now(),
    };
    const batch = writeBatch(db);
    batch.set(doc(db, "boards", b.id), b);
    const now = Date.now();
    const defaults: List[] = [
      { id: "l_" + makeId(), boardId: b.id, name: "Rejada", position: 0, kind: "planned", createdAt: now },
      { id: "l_" + makeId(), boardId: b.id, name: "Jarayonda", position: 1, kind: "in_progress", createdAt: now },
      { id: "l_" + makeId(), boardId: b.id, name: "Ko'rib chiqilmoqda", position: 2, kind: "review", createdAt: now },
      { id: "l_" + makeId(), boardId: b.id, name: "Bajarildi", position: 3, kind: "done", createdAt: now },
      { id: "l_" + makeId(), boardId: b.id, name: "Bajarilmadi", position: 4, kind: "failed", createdAt: now },
    ];
    for (const l of defaults) {
      batch.set(doc(db, "boards", b.id, "lists", l.id), l);
    }
    await batch.commit();
    return b;
  },
  updateBoard: async (id, patch) => {
    await updateDoc(doc(db, "boards", id), patch);
  },
  deleteBoard: async (id) => {
    const { lists, cards, comments } = get();
    const boardLists = lists.filter((l) => l.boardId === id);
    const boardCards = cards.filter((c) => c.boardId === id);
    const boardCommentIds = new Set(boardCards.map((c) => c.id));
    const boardComments = comments.filter((cm) => boardCommentIds.has(cm.cardId));

    const batch = writeBatch(db);
    for (const l of boardLists) {
      batch.delete(doc(db, "boards", id, "lists", l.id));
    }
    for (const c of boardCards) {
      batch.delete(doc(db, "boards", id, "cards", c.id));
    }
    for (const cm of boardComments) {
      batch.delete(doc(db, "boards", id, "comments", cm.id));
    }
    batch.delete(doc(db, "boards", id));
    await batch.commit();
  },
  toggleStar: async (id) => {
    const b = get().boards.find((x) => x.id === id);
    if (!b) return;
    await updateDoc(doc(db, "boards", id), { starred: !b.starred });
  },
  addBoardMember: async (boardId, userId) => {
    await updateDoc(doc(db, "boards", boardId), {
      memberIds: arrayUnion(userId),
    });
  },
  removeBoardMember: async (boardId, userId) => {
    await updateDoc(doc(db, "boards", boardId), {
      memberIds: arrayRemove(userId),
    });
  },
  leaveBoard: async (boardId, userId) => {
    await updateDoc(doc(db, "boards", boardId), {
      memberIds: arrayRemove(userId),
    });
  },
  migrateBoard: async (boardId) => {
    const boardLists = get().lists.filter((l) => l.boardId === boardId);
    const now = Date.now();
    
    // Check if board needs migration (has lists without kind field)
    const needsMigration = boardLists.some((l) => !l.kind);
    
    if (!needsMigration) return;
    
    const batch = writeBatch(db);
    
    // Update existing lists with kind field
    boardLists.forEach((list) => {
      let kind: "planned" | "in_progress" | "review" | "done" | "failed" = "planned";
      if (list.name === "Jarayonda") kind = "in_progress";
      else if (list.name === "Bajarildi") kind = "done";
      else if (list.name === "Ko'rib chiqilmoqda") kind = "review";
      else if (list.name === "Bajarilmadi") kind = "failed";
      
      batch.update(doc(db, "boards", boardId, "lists", list.id), { kind });
    });
    
    // Add missing columns if they don't exist
    const hasReview = boardLists.some((l) => l.name === "Ko'rib chiqilmoqda" || l.kind === "review");
    const hasFailed = boardLists.some((l) => l.name === "Bajarilmadi" || l.kind === "failed");
    
    if (!hasReview) {
      const reviewList: List = {
        id: "l_" + makeId(),
        boardId,
        name: "Ko'rib chiqilmoqda",
        position: 2,
        kind: "review",
        createdAt: now,
      };
      batch.set(doc(db, "boards", boardId, "lists", reviewList.id), reviewList);
    }
    
    if (!hasFailed) {
      const failedList: List = {
        id: "l_" + makeId(),
        boardId,
        name: "Bajarilmadi",
        position: 4,
        kind: "failed",
        createdAt: now,
      };
      batch.set(doc(db, "boards", boardId, "lists", failedList.id), failedList);
    }
    
    await batch.commit();
  },

  // ── lists ───────────────────────────────────────────────────────────────────

  createList: async (boardId, name) => {
    const existing = get().lists.filter((l) => l.boardId === boardId);
    const l: List = {
      id: "l_" + makeId(),
      boardId,
      name: name.trim() || "Yangi ustun",
      position: existing.length,
      kind: "planned",
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "boards", boardId, "lists", l.id), l);
    return l;
  },
  updateList: async (id, patch) => {
    const l = findList(id, get().lists);
    if (!l) return;
    await updateDoc(doc(db, "boards", l.boardId, "lists", id), patch);
  },
  deleteList: async (id) => {
    const l = findList(id, get().lists);
    if (!l) return;
    const listCards = get().cards.filter((c) => c.listId === id);
    const cardIds = new Set(listCards.map((c) => c.id));
    const commentsToDelete = get().comments.filter((cm) =>
      cardIds.has(cm.cardId),
    );

    const batch = writeBatch(db);
    for (const cm of commentsToDelete) {
      batch.delete(doc(db, "boards", l.boardId, "comments", cm.id));
    }
    for (const c of listCards) {
      batch.delete(doc(db, "boards", l.boardId, "cards", c.id));
    }
    batch.delete(doc(db, "boards", l.boardId, "lists", id));
    await batch.commit();
  },
  reorderLists: async (boardId, orderedIds) => {
    const batch = writeBatch(db);
    orderedIds.forEach((id, idx) => {
      batch.update(doc(db, "boards", boardId, "lists", id), { position: idx });
    });
    await batch.commit();
  },
  setListColor: async (listId, color) => {
    const l = findList(listId, get().lists);
    if (!l) return;
    await updateDoc(doc(db, "boards", l.boardId, "lists", listId), { color });
  },

  // ── cards ───────────────────────────────────────────────────────────────────

  createCard: async (listId, boardId, title, createdBy) => {
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
    await setDoc(doc(db, "boards", boardId, "cards", c.id), c);
    return c;
  },
  updateCard: async (id, patch) => {
    const c = findCard(id, get().cards);
    if (!c) return;
    await updateDoc(doc(db, "boards", c.boardId, "cards", id), patch);
  },
  deleteCard: async (id) => {
    const c = findCard(id, get().cards);
    if (!c) return;
    const cardComments = get().comments.filter((cm) => cm.cardId === id);
    const batch = writeBatch(db);
    for (const cm of cardComments) {
      batch.delete(doc(db, "boards", c.boardId, "comments", cm.id));
    }
    batch.delete(doc(db, "boards", c.boardId, "cards", id));
    await batch.commit();
  },
  moveCard: async (cardId, targetListId, targetIndex) => {
    const state = get();
    const card = findCard(cardId, state.cards);
    if (!card) return;
    const sourceListId = card.listId;

    const sourceCards = state.cards
      .filter((c) => c.listId === sourceListId && c.id !== cardId)
      .sort((a, b) => a.position - b.position);
    const targetCards =
      sourceListId === targetListId
        ? sourceCards
        : state.cards
            .filter((c) => c.listId === targetListId)
            .sort((a, b) => a.position - b.position);

    const clamped = Math.max(0, Math.min(targetIndex, targetCards.length));
    const newTargetCards = [...targetCards];
    newTargetCards.splice(clamped, 0, { ...card, listId: targetListId });

    const batch = writeBatch(db);
    newTargetCards.forEach((c, idx) => {
      batch.update(doc(db, "boards", card.boardId, "cards", c.id), {
        listId: targetListId,
        position: idx,
      });
    });
    if (sourceListId !== targetListId) {
      sourceCards.forEach((c, idx) => {
        batch.update(doc(db, "boards", card.boardId, "cards", c.id), {
          listId: sourceListId,
          position: idx,
        });
      });
    }
    await batch.commit();
  },
  reorderCards: async (listId, orderedIds) => {
    const state = get();
    const someCard = findCard(orderedIds[0] ?? "", state.cards);
    if (!someCard) return;
    const batch = writeBatch(db);
    orderedIds.forEach((id, idx) => {
      batch.update(doc(db, "boards", someCard.boardId, "cards", id), {
        position: idx,
      });
    });
    await batch.commit();
  },
  addCardLabel: async (cardId, label) => {
    const c = findCard(cardId, get().cards);
    if (!c) return;
    const newLabel: Label = { ...label, id: makeId() };
    await updateDoc(doc(db, "boards", c.boardId, "cards", cardId), {
      labels: [...c.labels, newLabel],
    });
  },
  removeCardLabel: async (cardId, labelId) => {
    const c = findCard(cardId, get().cards);
    if (!c) return;
    await updateDoc(doc(db, "boards", c.boardId, "cards", cardId), {
      labels: c.labels.filter((l) => l.id !== labelId),
    });
  },
  toggleCardMember: async (cardId, userId) => {
    const c = findCard(cardId, get().cards);
    if (!c) return;
    const isMember = c.memberIds.includes(userId);
    await updateDoc(doc(db, "boards", c.boardId, "cards", cardId), {
      memberIds: isMember ? arrayRemove(userId) : arrayUnion(userId),
    });
  },
  sendCardToReview: async (cardId) => {
    const c = findCard(cardId, get().cards);
    if (!c) return;
    const board = get().boards.find((b) => b.id === c.boardId);
    if (!board) return;
    const reviewList = get().lists.find(
      (l) => l.boardId === board.id && l.kind === "review"
    );
    if (!reviewList) return;
    await get().moveCard(cardId, reviewList.id, 0);
  },
  reconcileCards: async () => {
    const state = get();
    const now = Date.now();
    const boards = state.boards;
    
    for (const board of boards) {
      const lists = state.lists.filter((l) => l.boardId === board.id);
      const plannedList = lists.find((l) => l.kind === "planned");
      const inProgressList = lists.find((l) => l.kind === "in_progress");
      const reviewList = lists.find((l) => l.kind === "review");
      const doneList = lists.find((l) => l.kind === "done");
      const failedList = lists.find((l) => l.kind === "failed");
      
      if (!plannedList || !inProgressList || !failedList) continue;
      
      const cards = state.cards.filter((c) => c.boardId === board.id);
      
      for (const card of cards) {
        // startAt <= now and in Planned → In Progress
        if (
          card.startAt &&
          card.startAt <= now &&
          card.listId === plannedList.id
        ) {
          await get().moveCard(card.id, inProgressList.id, 0);
        }
        
        // dueDate < now and in Planned/In Progress → Failed
        if (
          card.dueDate &&
          card.dueDate < now &&
          !card.completed &&
          (card.listId === plannedList.id || card.listId === inProgressList.id)
        ) {
          await get().moveCard(card.id, failedList.id, 0);
        }
        
        // Cards in review are not affected by auto-reconcile
      }
    }
  },

  // ── comments ────────────────────────────────────────────────────────────────

  addComment: async (cardId, userId, text) => {
    const c = findCard(cardId, get().cards);
    if (!c) throw new Error("Karta topilmadi");
    const cm: Comment = {
      id: "cm_" + makeId(),
      cardId,
      userId,
      text: text.trim(),
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "boards", c.boardId, "comments", cm.id), cm);
    return cm;
  },
  deleteComment: async (commentId) => {
    const cm = findComment(commentId, get().comments);
    if (!cm) return;
    const card = findCard(cm.cardId, get().cards);
    if (!card) return;
    await deleteDoc(doc(db, "boards", card.boardId, "comments", commentId));
  },

  // ── invitations ─────────────────────────────────────────────────────────────

  sendInvitation: async (boardId, inviteeEmail, inviter) => {
    const normalized = inviteeEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) {
      throw new Error("Email noto'g'ri");
    }
    if (normalized === inviter.email.trim().toLowerCase()) {
      throw new Error("O'zingizni taklif qila olmaysiz");
    }
    const board = get().boards.find((b) => b.id === boardId);
    if (!board) throw new Error("Doska topilmadi");
    const existingUser = get().users.find(
      (u) => u.email.trim().toLowerCase() === normalized,
    );
    if (existingUser && board.memberIds.includes(existingUser.id)) {
      throw new Error("Bu foydalanuvchi allaqachon doska a'zosi");
    }

    const id = invitationIdFor(boardId, normalized);
    const invitation: Invitation = {
      id,
      boardId,
      boardName: board.name,
      workspaceId: board.workspaceId,
      inviterUid: inviter.id,
      inviterName: inviter.name,
      inviterEmail: inviter.email,
      inviteeEmail: normalized,
      inviteeUid: null,
      status: "pending",
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "invitations", id), invitation);
    return invitation;
  },

  acceptInvitation: async (invitationId) => {
    const inv = get().invitations.find((i) => i.id === invitationId);
    if (!inv) throw new Error("Taklif topilmadi");
    if (inv.status !== "pending")
      throw new Error("Bu taklif allaqachon javob berilgan");
    const currentUserId = useAuthStore.getState().currentUserId;
    if (!currentUserId) throw new Error("Tizimga kirmagansiz");

    // Atomic: mark invitation accepted AND add user to board.memberIds. The
    // board-update rule uses getAfter() on the invitation so both writes must
    // succeed together.
    const batch = writeBatch(db);
    batch.update(doc(db, "invitations", invitationId), {
      status: "accepted",
      respondedAt: Date.now(),
      inviteeUid: currentUserId,
    });
    batch.update(doc(db, "boards", inv.boardId), {
      memberIds: arrayUnion(currentUserId),
    });
    await batch.commit();
  },

  declineInvitation: async (invitationId) => {
    await updateDoc(doc(db, "invitations", invitationId), {
      status: "declined",
      respondedAt: Date.now(),
    });
  },

  cancelInvitation: async (invitationId) => {
    await deleteDoc(doc(db, "invitations", invitationId));
  },
}));
