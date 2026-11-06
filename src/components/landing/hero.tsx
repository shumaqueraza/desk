"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const LINES = [
  { text: "Who came.", accent: false },
  { text: "Who scored.", accent: false },
  { text: "Who is ready.", accent: true },
];

const SPORTS = ["Cricket", "Football", "Kabaddi", "Athletics", "Hockey"];

/**
 * Hero. The entrance plays once at load (the hero is on screen from the
 * first paint, so there is nothing to wait for); the scroll parallax on
 * the type and the photograph stays a JS-only enhancement that never
 * hides content.
 */
export function Hero({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const typeY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const lineVariants = {
    hidden: { y: "112%" },
    show: (i: number) => ({
      y: "0%",
      transition: {
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: 0.25 + i * 0.11,
      },
    }),
  };

  return (
    <section
      ref={ref}
      className="relative min-h-svh flex flex-col justify-end overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] gap-8 lg:gap-14 items-start pt-24 pb-12 lg:pt-28 lg:pb-16 flex-1 content-center">
        {/* Type block */}
        <motion.div
          className="lg:col-span-7 lg:col-start-1 lg:row-start-1 relative z-10"
          style={reduced ? undefined : { y: typeY }}
        >
          <h1 className="display-poster text-bone text-[clamp(2rem,5vw,4.7rem)]">
            {LINES.map((line, i) => (
              <span key={line.text} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
                <motion.span
                  className={`block ${line.accent ? "text-volt" : ""}`}
                  custom={i}
                  variants={reduced ? undefined : lineVariants}
                  initial="hidden"
                  animate="show"
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-[30rem] text-[1.06rem] sm:text-[1.16rem] leading-relaxed text-bone-2"
          >
            Every practice marked, every match scored, every player on the books
            of one academy in Dumka, Jharkhand.
          </motion.p>
        </motion.div>

        {/* The opening photograph: athletics, in a soft rounded frame */}
        <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 relative lg:self-stretch order-3 lg:order-none">
          <div
            aria-hidden
            className="absolute -top-3 -right-3 w-full h-full border border-volt/25 rounded-[28px] hidden sm:block"
          />
          <motion.figure
            initial={reduced ? undefined : { clipPath: "inset(0% 0% 100% 0%)", borderRadius: "48px" }}
            animate={reduced ? undefined : { clipPath: "inset(0% 0% 0% 0%)", borderRadius: "28px" }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.83, 0, 0.17, 1] }}
            className="relative bg-pitch-2 h-full lg:min-h-[460px] border border-pitch-line overflow-hidden"
          >
            <div className="h-[42vh] lg:absolute lg:inset-0 lg:h-auto min-h-[300px] lg:min-h-0 overflow-hidden">
              <motion.img
                src="/images/silhouette.jpg"
                alt="A lone athlete silhouetted against the evening sun on the training ground"
                style={reduced ? undefined : { y: imgY, scale: 1.12 }}
                className="h-full w-full lg:absolute lg:inset-0 object-cover object-[50%_42%] brightness-[1.08]"
                fetchPriority="high"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-pitch/55 via-transparent to-transparent" />
            </div>
            <figcaption className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-4 sm:right-4 sm:translate-x-0 flex items-center justify-center sm:justify-between gap-3">
              <span className="micro-label !text-[0.56rem] text-bone bg-pitch/70 backdrop-blur rounded-full px-3.5 py-2 whitespace-nowrap">
                The academy · first light
              </span>
              <span className="micro-label !text-[0.56rem] text-volt bg-pitch/70 backdrop-blur rounded-full px-3.5 py-2 whitespace-nowrap hidden sm:block">
                N°01
              </span>
            </figcaption>
          </motion.figure>
        </div>

        {/* The door — right under the pitch on mobile, under the type on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-none lg:col-span-7 lg:col-start-1 lg:row-start-2 flex flex-wrap items-center gap-5 lg:pt-8"
        >
          <Link
            href={href}
            className="group inline-flex h-[58px] items-center gap-3 rounded-full bg-volt px-9 micro-label !text-[0.78rem] !tracking-[0.2em] text-pitch transition-all duration-200 hover:bg-bone focus-visible:outline-volt shadow-[0_0_40px_-8px_rgba(200,239,76,0.45)] hover:shadow-[0_0_44px_-6px_rgba(236,238,224,0.35)]"
          >
            {label}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1.5"
              aria-hidden
            />
          </Link>
        </motion.div>
      </div>

      {/* The sports of the academy, one ruled line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.25 }}
        className="relative border-t border-pitch-line"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-12 flex items-center justify-between gap-4">
          <ul className="flex items-center gap-3 sm:gap-5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {SPORTS.map((s, i) => (
              <li key={s} className="flex items-center gap-3 sm:gap-5">
                <span className="micro-label text-bone/75 !text-[0.62rem]">{s}</span>
                {i < SPORTS.length - 1 && (
                  <span className="text-volt/70 text-[0.6rem]" aria-hidden>
                    /
                  </span>
                )}
              </li>
            ))}
          </ul>
          <span className="micro-label text-bone-2/80 !text-[0.6rem] hidden sm:block shrink-0">
            Est. Dumka
          </span>
        </div>
      </motion.div>
    </section>
  );
}
