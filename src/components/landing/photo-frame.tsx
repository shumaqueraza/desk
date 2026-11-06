"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useReveal } from "./reveal";

/**
 * A photograph framed like a scoreboard entry: volt hairline, mono caption.
 * Reveals with a clip wipe as it enters the viewport — through useReveal,
 * so the wipe still plays on scroll but the photograph can never stay
 * hidden if the element sits in a scroll observer's dead zone.
 * The parallax drift stays a JS enhancement — decorative only.
 */
export function PhotoFrame({
  src,
  alt,
  caption,
  index,
  className = "",
  parallax = 0,
  priority = false,
  sizes = "(max-width: 640px) 100vw, 40vw",
}: {
  src: string;
  alt: string;
  caption: string;
  index: string;
  className?: string;
  parallax?: number;
  priority?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const reveal = useReveal<HTMLDivElement>();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);

  return (
    <figure ref={ref} className={`group relative ${className}`}>
      <motion.div
        ref={reveal.ref}
        className="overflow-hidden h-full w-full bg-pitch-2 rounded-[28px] border border-pitch-line"
        initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0%)", borderRadius: "44px" }}
        animate={
          reveal.show
            ? { clipPath: "inset(0% 0% 0% 0%)", borderRadius: "28px" }
            : { clipPath: "inset(100% 0% 0% 0%)", borderRadius: "44px" }
        }
        transition={{ duration: 0.95, ease: [0.83, 0, 0.17, 1] }}
      >
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.045]">
          <motion.img
            src={src}
            alt={alt}
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
            style={reduced || parallax === 0 ? undefined : { y }}
            className="h-full w-full object-cover brightness-[1.06]"
          />
        </div>
      </motion.div>
      {/* volt pill that draws in on hover, inset so it respects the radius */}
      <span
        aria-hidden
        className="absolute bottom-4 left-4 right-4 h-[3px] bg-volt origin-left scale-x-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <figcaption className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3">
        <span className="micro-label !text-[0.56rem] text-bone bg-pitch/70 backdrop-blur rounded-full px-3.5 py-2">
          {index}
        </span>
        <span className="micro-label !text-[0.66rem] text-bone bg-pitch/70 backdrop-blur rounded-full px-3.5 py-2 group-hover:text-volt transition-colors">
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}
