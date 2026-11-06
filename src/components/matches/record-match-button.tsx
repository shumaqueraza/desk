"use client";

import { useState } from "react";
import { MatchForm } from "@/components/matches/match-form";
import { primaryBtn } from "@/components/shared/form-styles";
import { Trophy } from "lucide-react";

export function RecordMatchButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={primaryBtn}>
        <Trophy className="size-5" aria-hidden />
        Record match
      </button>
      <MatchForm open={open} onOpenChange={setOpen} />
    </>
  );
}
