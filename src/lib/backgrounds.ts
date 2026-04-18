import type { BoardBackground } from "./types";

export const BOARD_BACKGROUNDS: Record<BoardBackground, string> = {
  "gradient-violet":
    "linear-gradient(135deg, #7c3aed 0%, #ec4899 60%, #f97316 100%)",
  "gradient-rose":
    "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #be123c 100%)",
  "gradient-emerald":
    "linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)",
  "gradient-amber":
    "linear-gradient(135deg, #f59e0b 0%, #f97316 60%, #ef4444 100%)",
  "gradient-sky":
    "linear-gradient(135deg, #0ea5e9 0%, #6366f1 60%, #8b5cf6 100%)",
  "gradient-slate":
    "linear-gradient(135deg, #334155 0%, #1e293b 60%, #0f172a 100%)",
};

export const BOARD_BACKGROUND_OPTIONS: BoardBackground[] = [
  "gradient-violet",
  "gradient-sky",
  "gradient-emerald",
  "gradient-rose",
  "gradient-amber",
  "gradient-slate",
];

export const LABEL_COLORS: Record<
  import("./types").LabelColor,
  { bg: string; fg: string; name: string }
> = {
  violet: { bg: "#7c3aed", fg: "#ffffff", name: "Binafsha" },
  pink: { bg: "#ec4899", fg: "#ffffff", name: "Pushti" },
  amber: { bg: "#f59e0b", fg: "#1f1300", name: "Sariq" },
  emerald: { bg: "#10b981", fg: "#052e1d", name: "Yashil" },
  sky: { bg: "#0ea5e9", fg: "#001a2b", name: "Osmon" },
  rose: { bg: "#f43f5e", fg: "#ffffff", name: "Qizil" },
  slate: { bg: "#475569", fg: "#ffffff", name: "Kulrang" },
};
