"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PlayerForm } from "@/components/players/player-form";
import { primaryBtn } from "@/components/shared/form-styles";

export function AddPlayerButton({ nextJersey }: { nextJersey: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={primaryBtn}>
        <UserPlus className="size-5" aria-hidden />
        Add player
      </button>
      <PlayerForm open={open} onOpenChange={setOpen} mode="add" nextJersey={nextJersey} />
    </>
  );
}
