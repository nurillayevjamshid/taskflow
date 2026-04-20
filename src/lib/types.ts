export type ID = string;

export type LabelColor =
  | "violet"
  | "pink"
  | "amber"
  | "emerald"
  | "sky"
  | "rose"
  | "slate";

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: number;
}

export interface Workspace {
  id: ID;
  name: string;
  description?: string;
  ownerId: ID;
  memberIds: ID[];
  createdAt: number;
}

export type BoardBackground =
  | "gradient-violet"
  | "gradient-rose"
  | "gradient-emerald"
  | "gradient-amber"
  | "gradient-sky"
  | "gradient-slate";

export interface Board {
  id: ID;
  workspaceId: ID;
  name: string;
  description?: string;
  background: BoardBackground;
  memberIds: ID[];
  createdBy: ID;
  createdAt: number;
  archived?: boolean;
  starred?: boolean;
}

export type ListKind = "planned" | "in_progress" | "review" | "done" | "failed";

export interface List {
  id: ID;
  boardId: ID;
  name: string;
  position: number;
  kind: ListKind;
  color?: string;
  createdAt: number;
}

export interface Label {
  id: ID;
  name: string;
  color: LabelColor;
}

export interface Card {
  id: ID;
  listId: ID;
  boardId: ID;
  title: string;
  description?: string;
  position: number;
  labels: Label[];
  memberIds: ID[];
  dueDate?: number | null;
  startAt?: number | null;
  completed?: boolean;
  createdBy: ID;
  createdAt: number;
}

export interface Comment {
  id: ID;
  cardId: ID;
  userId: ID;
  text: string;
  createdAt: number;
}

export interface Activity {
  id: ID;
  boardId: ID;
  userId: ID;
  text: string;
  createdAt: number;
}
