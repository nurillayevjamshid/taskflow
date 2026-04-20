import { doc, writeBatch } from "firebase/firestore";
import type { Board, Card, List, Workspace } from "./types";
import { db } from "./firebase";
import { makeId } from "./hash";

export interface StarterContent {
  workspace: Workspace;
  board: Board;
  lists: List[];
  cards: Card[];
}

/** Build an in-memory starter workspace + board + cards for a new user. */
export function buildStarterContent(ownerId: string): StarterContent {
  const now = Date.now();
  const workspace: Workspace = {
    id: "w_" + makeId(),
    name: "Mening ishxonam",
    description: "Shaxsiy va jamoa loyihalari uchun asosiy ishxona",
    ownerId,
    memberIds: [ownerId],
    createdAt: now,
  };
  const board: Board = {
    id: "b_" + makeId(),
    workspaceId: workspace.id,
    name: "Boshlash uchun doska",
    description: "Taskly bilan ishni boshlash uchun namuna doska",
    background: "gradient-violet",
    memberIds: [ownerId],
    createdBy: ownerId,
    createdAt: now,
    starred: true,
  };
  const lists: List[] = [
    { id: "l_" + makeId(), boardId: board.id, name: "Rejada", position: 0, createdAt: now },
    { id: "l_" + makeId(), boardId: board.id, name: "Jarayonda", position: 1, createdAt: now },
    { id: "l_" + makeId(), boardId: board.id, name: "Tekshirishda", position: 2, createdAt: now },
    { id: "l_" + makeId(), boardId: board.id, name: "Bajarildi", position: 3, createdAt: now },
  ];

  const mkCard = (
    listId: string,
    title: string,
    description: string,
    position: number,
    extras: Partial<Card> = {},
  ): Card => ({
    id: "c_" + makeId(),
    listId,
    boardId: board.id,
    title,
    description,
    position,
    labels: [],
    memberIds: [ownerId],
    createdBy: ownerId,
    createdAt: now,
    ...extras,
  });

  const cards: Card[] = [
    mkCard(
      lists[0].id,
      "Taskly bilan tanishish",
      "Ushbu doskani o'zingizga moslang: ustun qo'shing, kartalarni ko'chiring, a'zolarni taklif qiling.",
      0,
      {
        labels: [
          { id: makeId(), name: "Onboarding", color: "violet" },
          { id: makeId(), name: "Muhim", color: "rose" },
        ],
      },
    ),
    mkCard(
      lists[0].id,
      "Mijoz bilan uchrashuvni rejalashtirish",
      "Juma kuni soat 15:00 ga taklif yuborish.",
      1,
      {
        labels: [{ id: makeId(), name: "Sotuvlar", color: "emerald" }],
        dueDate: now + 1000 * 60 * 60 * 48,
      },
    ),
    mkCard(
      lists[1].id,
      "Landing page dizayn konsepti",
      "Hero qism uchun 3 ta variant tayyorlash.",
      0,
      {
        labels: [{ id: makeId(), name: "Dizayn", color: "pink" }],
      },
    ),
    mkCard(
      lists[2].id,
      "To'lov oqimini test qilish",
      "Stripe sandbox muhitida asosiy ssenariylarni tekshirish.",
      0,
      {
        labels: [{ id: makeId(), name: "QA", color: "amber" }],
      },
    ),
    mkCard(
      lists[3].id,
      "Jamoa uchun brending qo'llanmasi",
      "PDF shaklda e'lon qilindi.",
      0,
      {
        labels: [{ id: makeId(), name: "Bajarildi", color: "sky" }],
        completed: true,
      },
    ),
  ];

  return { workspace, board, lists, cards };
}

/** Write starter content to Firestore in a single batch. */
export async function writeStarterContent(s: StarterContent): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, "workspaces", s.workspace.id), s.workspace);
  batch.set(doc(db, "boards", s.board.id), s.board);
  for (const l of s.lists) {
    batch.set(doc(db, "boards", s.board.id, "lists", l.id), l);
  }
  for (const c of s.cards) {
    batch.set(doc(db, "boards", s.board.id, "cards", c.id), c);
  }
  await batch.commit();
}

/** Legacy export: kept so callers that used to create the sample data can still compile. */
export async function ensureStarterContentForUser(ownerId: string): Promise<void> {
  await writeStarterContent(buildStarterContent(ownerId));
}
