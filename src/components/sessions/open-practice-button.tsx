"use client";

import { useState } from "react";
import { SessionForm } from "@/components/sessions/session-form";
import { primaryBtn } from "@/components/shared/form-styles";
import { CalendarPlus } from "lucide-react";

export function OpenPracticeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={primaryBtn}>
        <CalendarPlus className="size-5" aria-hidden />
        Open practice
      </button>
      <SessionForm open={open} onOpenChange={setOpen} />
    </>
  );
}
