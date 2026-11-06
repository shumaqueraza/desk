"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { PlayerForm, type EditablePlayer } from "@/components/players/player-form";
import { secondaryBtn } from "@/components/shared/form-styles";

export function EditPlayerButton({ player }: { player: EditablePlayer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={secondaryBtn}>
        <Pencil className="size-4.5" aria-hidden />
        Edit details
      </button>
      <PlayerForm open={open} onOpenChange={setOpen} mode="edit" player={player} />
    </>
  );
}
