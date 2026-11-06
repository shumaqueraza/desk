"use client";

import { MotionConfig } from "framer-motion";

/**
 * Public-site shell: pitch canvas, bone type, motion that respects
 * the visitor's reduced-motion preference.
 */
export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="pitch-surface grain text-bone min-h-svh flex flex-col font-display antialiased">
        {children}
      </div>
    </MotionConfig>
  );
}
