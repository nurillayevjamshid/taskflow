"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";

export function CreateWorkspaceDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createWorkspace = useDataStore((s) => s.createWorkspace);
  const currentUserId = useAuthStore((s) => s.currentUserId);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !name.trim()) return;
    createWorkspace(name, description, currentUserId);
    setOpen(false);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button variant="outline">
              <Plus className="size-4" />
              Ish maydoni
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi ish maydoni</DialogTitle>
          <DialogDescription>
            Ish maydoni jamoa va bir nechta doskani birlashtiradi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Nomi</Label>
            <Input
              id="ws-name"
              placeholder="Masalan, Acme dizayn bo'limi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-desc">Tavsif</Label>
            <Textarea
              id="ws-desc"
              placeholder="Qisqacha tavsif (ixtiyoriy)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Yaratish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
