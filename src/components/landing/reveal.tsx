"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, type Variants } from "framer-motion";

/**
 * The classic line rise: the line sits 112% below its clip box and climbs
 * up into place. `custom={i}` staggers the lines ~0.1s apart.
 */
export const riseLine =
  (duration = 0.95): Variants => ({
    hidden: { y: "112%" },
    show: (i: number) => ({
      y: "0%",
      transition: { duration, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.1 },
    }),
  });

/**
 * Scroll-reveal trigger for the landing page — the same bottom-up reveal
 * the page always had, but it can no longer dead-zone at the end of the page.
 *
 * What was broken before: reveals observed the viewport with a two-sided
 * margin like "-20% 0px", which shrinks the observer box from the top AND
 * the bottom. "is open." and the Sign in button are the LAST elements of
 * the page — once the page ends under them there is nothing left to scroll,
 * so they could never climb into the shrunken box and stayed hidden forever.
 * That is why the closing headline and button sometimes never appeared.
 *
 * Two-layer fix:
 * 1. The trigger margin now shrinks from the BOTTOM only: an element
 *    reveals as soon as it rises past the last slice of the viewport.
 *    Everything mid-page keeps behaving exactly like before.
 * 2. End-of-page guard: the moment the page is scrolled to its end, any
 *    still-hidden element that is already on screen is forced to reveal.
 *    The last elements of the page therefore ALWAYS appear, whatever the
 *    screen height, the scroll speed, or a scroll-restored reload.
 *
 * `prefers-reduced-motion` skips the animation entirely (instant reveal).
 */
/** Bottom-only trigger margins: an element reveals once it rises past the
 *  last 8–12% of the viewport. (Never a two-sided margin — see above.) */
export type RevealMargin = "0px 0px -8% 0px" | "0px 0px -10% 0px" | "0px 0px -12% 0px";

export function useReveal<T extends HTMLElement>(margin: RevealMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin });
  const [endForced, setEndForced] = useState(false);

  useEffect(() => {
    if (inView || endForced) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const doc = document.documentElement;
      const atEnd = window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
      if (!atEnd) return;
      // The page is at its end and this element is on screen: it can never
      // scroll any higher, so the observer alone would never fire. Reveal now.
      if (el.getBoundingClientRect().top < window.innerHeight - 4) setEndForced(true);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [inView, endForced, ref]);

  const show = Boolean(reduced) || inView || endForced;
  return { ref, show, reduced: Boolean(reduced) };
}
