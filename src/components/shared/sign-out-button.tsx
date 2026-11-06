"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { dangerBtn, quietDangerBtn } from "@/components/shared/form-styles";

export function SignOutButton({ full = false, quiet = false }: { full?: boolean; quiet?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className={`${quiet ? quietDangerBtn : dangerBtn} ${full ? "w-full" : ""}`}
    >
      {busy ? <Loader2 className="size-4.5 animate-spin" aria-hidden /> : <LogOut className="size-4.5" aria-hidden />}
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
