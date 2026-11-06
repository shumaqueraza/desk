"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { riseLine, useReveal } from "./reveal";

/**
 * The closing band: one wide photograph of the tackle, then the door —
 * giant type and the single action of the page.
 *
 * The headline lines rise up from below and the button fades in, the
 * moment the block scrolls into view. Because this block is the LAST
 * thing on the page, its reveal runs through useReveal, whose
 * end-of-page guard makes sure "is open." and the Sign in button can
 * never again be stranded hidden at maximum scroll.
 */
export function ClosingSection({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [-36, 0]);

  // One trigger for the whole door block: the lines rise staggered,
  // the button fades up right after them.
  const door = useReveal<HTMLDivElement>("0px 0px -8% 0px");
  const rise = riseLine(0.95);

  const lines = [
    { text: "The desk", accent: false },
    { text: "is open.", accent: true },
  ];

  return (
    <section ref={ref} aria-labelledby="closing-heading" className="relative">
      {/* The tackle — FULL BLEED: the photograph runs edge to edge, no box,
          no rounded corners; a vignette blends every side into the pitch */}
      <div className="relative h-[46vh] min-h-[340px]">
        <div className="relative h-full overflow-hidden">
          <motion.img
            src="/images/band-kabaddi.jpg"
            alt="A kabaddi raider held mid-air by defenders"
            style={reduced ? undefined : { y: imgY, scale: 1.12 }}
            className="h-full w-full object-cover brightness-[1.06]"
            loading="lazy"
            sizes="100vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-pitch/40 via-transparent to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-pitch/80 via-transparent to-pitch/60"
          />
          {/* the vignette — soft dark blend on all four edges, no visible frame */}
          <div
            aria-hidden
            className="absolute inset-0 shadow-[inset_0_0_110px_46px_rgba(10,15,10,0.66)]"
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-5 flex items-baseline justify-between gap-4">
              <span className="micro-label !text-[0.62rem] text-bone bg-pitch/70 backdrop-blur rounded-full px-3.5 py-2 whitespace-nowrap">Kabaddi · the tackle</span>
              <span className="micro-label !text-[0.62rem] text-bone/80 bg-pitch/70 backdrop-blur rounded-full px-3.5 py-2 hidden sm:block whitespace-nowrap">
                Match day, the Dumka ground
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The door */}
      <div
        ref={door.ref}
        className="mx-auto max-w-7xl px-5 sm:px-8 pt-12 sm:pt-14 lg:pt-16 pb-16 sm:pb-20"
      >
        <div className="border-t-2 border-volt pt-8 lg:pt-10 flex flex-wrap items-end justify-between gap-x-14 gap-y-8">
          <h2
            id="closing-heading"
            className="display-poster text-bone text-[clamp(2.9rem,8.4vw,8rem)]"
          >
            {lines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
                <motion.span
                  className={`block ${line.accent ? "text-volt" : ""}`}
                  variants={rise}
                  custom={i}
                  initial={reduced ? false : "hidden"}
                  animate={door.show ? "show" : "hidden"}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={door.show ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pb-3"
          >
            <Link
              href={href}
              className="group inline-flex h-[64px] items-center gap-3 rounded-full bg-volt px-10 micro-label !text-[0.8rem] !tracking-[0.2em] text-pitch transition-all duration-200 hover:bg-bone focus-visible:outline-volt shadow-[0_0_44px_-8px_rgba(200,239,76,0.45)]"
            >
              {label}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1.5"
                aria-hidden
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
