import type { BoardBackground } from "./types";

// Unsplash image URLs for board backgrounds
const IMAGE_BACKGROUNDS = {
  "image-1": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80", // Mountains
  "image-2": "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80", // Lake & mountains
  "image-3": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80", // Forest
  "image-4": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80", // Ocean sunset
  "image-5": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80", // Water texture
  "image-6": "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1920&q=80", // Nature green
  "image-7": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80", // Night sky stars
  "image-8": "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80", // Gradient abstract
  "image-9": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80", // Geometric pattern
  "image-10": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80", // Soft gradient
};

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
  ...IMAGE_BACKGROUNDS,
};

export const BOARD_BACKGROUND_IMAGES: Record<string, string> = IMAGE_BACKGROUNDS;

export const BOARD_BACKGROUND_OPTIONS: BoardBackground[] = [
  "gradient-violet",
  "gradient-sky",
  "gradient-emerald",
  "gradient-rose",
  "gradient-amber",
  "gradient-slate",
  "image-1",
  "image-2",
  "image-3",
  "image-4",
  "image-5",
  "image-6",
  "image-7",
  "image-8",
  "image-9",
  "image-10",
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
