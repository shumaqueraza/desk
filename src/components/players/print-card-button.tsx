"use client";

import { useEffect, useRef } from "react";
import { Printer } from "lucide-react";
import { secondaryBtn } from "@/components/shared/form-styles";

export function PrintCardButton() {
  const printed = useRef(false);

  useEffect(() => {
    const fire = () => {
      if (printed.current) return;
      printed.current = true;
      window.setTimeout(() => window.print(), 400);
    };

    if (document.readyState === "complete") {
      fire();
      return;
    }

    window.addEventListener("load", fire, { once: true });
    return () => window.removeEventListener("load", fire);
  }, []);

  return (
    <button type="button" onClick={() => window.print()} className={secondaryBtn}>
      <Printer className="size-4.5" aria-hidden />
      Save as PDF
    </button>
  );
}
