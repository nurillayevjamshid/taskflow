"use client";

import { useState } from "react";
import { ImageIcon, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BOARD_BACKGROUNDS,
  BOARD_BACKGROUND_OPTIONS,
  BOARD_BACKGROUND_IMAGES,
} from "@/lib/backgrounds";
import type { BoardBackground } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  currentBackground: BoardBackground;
  onSelect: (background: BoardBackground) => void;
  trigger: React.ReactNode;
}

export function BackgroundPickerDialog({
  currentBackground,
  onSelect,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);

  const gradients = BOARD_BACKGROUND_OPTIONS.filter((b) =>
    b.startsWith("gradient-"),
  );
  const images = BOARD_BACKGROUND_OPTIONS.filter((b) => b.startsWith("image-"));

  const handleSelect = (background: BoardBackground) => {
    onSelect(background);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Fonni o&apos;zgartirish
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gradients Section */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Palette className="size-4" />
              Gradientlar
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {gradients.map((bg) => (
                <button
                  key={bg}
                  onClick={() => handleSelect(bg)}
                  className={cn(
                    "group relative h-16 w-full rounded-lg border-2 transition hover:scale-105",
                    currentBackground === bg
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent",
                  )}
                  style={{ background: BOARD_BACKGROUNDS[bg] }}
                >
                  {currentBackground === bg && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-black">
                        Tanlangan
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="size-4" />
              Rasmlar
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {images.map((bg) => (
                <button
                  key={bg}
                  onClick={() => handleSelect(bg)}
                  className={cn(
                    "group relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition hover:scale-105",
                    currentBackground === bg
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent",
                  )}
                >
                  <img
                    src={BOARD_BACKGROUND_IMAGES[bg]}
                    alt={`Background ${bg}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {currentBackground === bg && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-black">
                        Tanlangan
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Bekor qilish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
