"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

/** Fixed masthead for the public site: transparent at rest, pitch on scroll. */
export function LandingNav({ href, label }: { href: string; label: string }) {
  const [solid, setSolid] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 32));

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid
          ? "bg-pitch/85 backdrop-blur-md border-b border-pitch-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="min-w-0 group flex items-center gap-2.5" aria-label="Play Ready — home">
          <img
            src="/images/play-ready-logo.png"
            alt=""
            className="h-8 w-8 rounded-lg border border-pitch-line/70 object-cover shrink-0"
          />
          <span className="display-poster text-bone text-[0.98rem] sm:text-[1.08rem] tracking-tight">
            PLAY READY
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-8">
          <Link
            href={href}
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-bone/25 bg-bone/5 backdrop-blur px-5 micro-label !text-[0.68rem] text-bone transition-colors duration-200 hover:border-volt hover:bg-volt hover:text-pitch focus-visible:border-volt"
          >
            {label}
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
