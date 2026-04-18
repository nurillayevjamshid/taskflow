import type { Board, Card, List, User, Workspace, Comment } from "./types";
import { makeId, pickAvatarColor } from "./hash";

export interface Seed {
  users: User[];
  workspaces: Workspace[];
  boards: Board[];
  lists: List[];
  cards: Card[];
  comments: Comment[];
}

// Demo users are always present so real users can invite teammates immediately
// on a fresh install. They cannot log in themselves — their passwordHash is
// set to an empty string so a login attempt will never match.
const DEMO_PASSWORD_HASH = "";

export function buildDemoSeed(): Seed {
  const now = Date.now();
  const alice: User = {
    id: "u_demo_alice",
    name: "Alisher Karimov",
    email: "alisher@taskflow.demo",
    passwordHash: DEMO_PASSWORD_HASH,
    avatarColor: pickAvatarColor("alisher"),
    createdAt: now,
  };
  const bob: User = {
    id: "u_demo_bob",
    name: "Bekzod Yo'ldoshev",
    email: "bekzod@taskflow.demo",
    passwordHash: DEMO_PASSWORD_HASH,
    avatarColor: pickAvatarColor("bekzod"),
    createdAt: now,
  };
  const mira: User = {
    id: "u_demo_mira",
    name: "Mira Rashidova",
    email: "mira@taskflow.demo",
    passwordHash: DEMO_PASSWORD_HASH,
    avatarColor: pickAvatarColor("mira"),
    createdAt: now,
  };
  return {
    users: [alice, bob, mira],
    workspaces: [],
    boards: [],
    lists: [],
    cards: [],
    comments: [],
  };
}

// Sample board used for new users the first time they visit the dashboard.
export function buildStarterContent(ownerId: string): {
  workspace: Workspace;
  board: Board;
  lists: List[];
  cards: Card[];
} {
  const now = Date.now();
  const workspace: Workspace = {
    id: makeId(),
    name: "Mening ishxonam",
    description: "Shaxsiy va jamoa loyihalari uchun asosiy ishxona",
    ownerId,
    memberIds: [ownerId],
    createdAt: now,
  };
  const board: Board = {
    id: makeId(),
    workspaceId: workspace.id,
    name: "Boshlash uchun doska",
    description: "TaskFlow bilan ishni boshlash uchun namuna doska",
    background: "gradient-violet",
    memberIds: [ownerId],
    createdBy: ownerId,
    createdAt: now,
    starred: true,
  };
  const l1: List = {
    id: makeId(),
    boardId: board.id,
    name: "Rejada",
    position: 0,
    createdAt: now,
  };
  const l2: List = {
    id: makeId(),
    boardId: board.id,
    name: "Jarayonda",
    position: 1,
    createdAt: now,
  };
  const l3: List = {
    id: makeId(),
    boardId: board.id,
    name: "Tekshirishda",
    position: 2,
    createdAt: now,
  };
  const l4: List = {
    id: makeId(),
    boardId: board.id,
    name: "Bajarildi",
    position: 3,
    createdAt: now,
  };

  const card = (
    listId: string,
    title: string,
    description: string,
    position: number,
    extras: Partial<Card> = {},
  ): Card => ({
    id: makeId(),
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
    card(
      l1.id,
      "TaskFlow bilan tanishish",
      "Ushbu doskani o'zingizga moslang: ustun qo'shing, kartalarni ko'chiring, a'zolarni taklif qiling.",
      0,
      {
        labels: [
          { id: makeId(), name: "Onboarding", color: "violet" },
          { id: makeId(), name: "Muhim", color: "rose" },
        ],
      },
    ),
    card(
      l1.id,
      "Mijoz bilan uchrashuvni rejalashtirish",
      "Juma kuni soat 15:00 ga taklif yuborish.",
      1,
      {
        labels: [{ id: makeId(), name: "Sotuvlar", color: "emerald" }],
        dueDate: now + 1000 * 60 * 60 * 48,
      },
    ),
    card(
      l2.id,
      "Landing page dizayn konsepti",
      "Hero qism uchun 3 ta variant tayyorlash.",
      0,
      {
        labels: [{ id: makeId(), name: "Dizayn", color: "pink" }],
      },
    ),
    card(
      l3.id,
      "To'lov oqimini test qilish",
      "Stripe sandbox muhitida asosiy ssenariylarni tekshirish.",
      0,
      {
        labels: [{ id: makeId(), name: "QA", color: "amber" }],
      },
    ),
    card(
      l4.id,
      "Jamoa uchun brending qo'llanmasi",
      "PDF shaklda e'lon qilindi.",
      0,
      {
        labels: [{ id: makeId(), name: "Bajarildi", color: "sky" }],
        completed: true,
      },
    ),
  ];

  return { workspace, board, lists: [l1, l2, l3, l4], cards };
}
