"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { dangerBtn } from "@/components/shared/form-styles";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (
      !window.confirm(
        "Delete this register? Its attendance marks will be removed and readiness recalculates. This cannot be undone.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not delete the register.");
      } else {
        router.push("/practice");
        router.refresh();
      }
    } catch {
      setError("Could not reach the desk. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-red text-[0.82rem] font-bold">{error}</p>}
      <button type="button" onClick={remove} disabled={busy} className={dangerBtn}>
        {busy ? (
          <Loader2 className="size-4.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-4.5" aria-hidden />
        )}
        Delete register
      </button>
    </div>
  );
}
