"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhotoFrame } from "./photo-frame";
import { riseLine, useReveal } from "./reveal";

const REGISTER_KEEPS = [
  { name: "Practice", note: "The register, marked" },
  { name: "Attendance", note: "Counted as it stands" },
  { name: "Matches", note: "Every score on the sheet" },
  { name: "Readiness", note: "Who can go to trials" },
];

/**
 * The five sports of the academy, as an asymmetric photographic index —
 * two staggered rails, a full-width register plate, and one wide closing frame.
 *
 * Every block below reveals as it scrolls into view (lines rise from below,
 * photographs wipe open, plates fade up) through useReveal, which keeps the
 * scroll animation but can no longer hide content at the end of the page.
 */
export function SportsSection() {
  const reduced = useReducedMotion();

  // One trigger per revealing block, exactly as the page always behaved.
  const head = useReveal<HTMLDivElement>();
  const plate = useReveal<HTMLDivElement>();
  const dataRow = useReveal<HTMLDivElement>();

  const headLines = [
    { text: "Five sports.", accent: false },
    { text: "One register.", accent: true },
  ];

  return (
    <section aria-labelledby="sports-heading" className="relative pt-20 sm:pt-24 lg:pt-28 pb-16 lg:pb-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section head — anchored left, type first */}
        <div ref={head.ref} className="max-w-3xl">
          <p className="micro-label text-volt flex items-center gap-3">
            <span className="inline-block size-1.5 bg-volt" aria-hidden />
            The ground
          </p>
          <h2
            id="sports-heading"
            className="display-poster text-bone mt-5 text-[clamp(2.2rem,5.4vw,4.6rem)]"
          >
            {headLines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
                <motion.span
                  className={`block ${line.accent ? "text-volt" : ""}`}
                  variants={riseLine(0.9)}
                  custom={i}
                  initial={reduced ? false : "hidden"}
                  animate={head.show ? "show" : "hidden"}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={head.show ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-bone-2 text-[0.98rem] sm:text-[1.04rem] leading-relaxed max-w-[30rem]"
          >
            Cricket, football, kabaddi, athletics and hockey on one ground in
            Dumka — and one desk that keeps every squad in order.
          </motion.p>
        </div>

        {/* Two staggered rails, near-equal length */}
        <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 mt-14 lg:mt-20">
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            <PhotoFrame
              src="/images/sport-cricket.jpg"
              alt="A batsman in whites playing a shot on a matting pitch"
              index="N°01"
              caption="Cricket"
              parallax={26}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="aspect-[4/3.1] lg:aspect-[7/5.6]"
            />
            <PhotoFrame
              src="/images/sport-hockey.jpg"
              alt="Two hockey sticks contesting the ball on the turf"
              index="N°03"
              caption="Hockey"
              parallax={30}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="aspect-[4/3.1] lg:aspect-[7/5.6]"
            />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6 lg:mt-20">
            <PhotoFrame
              src="/images/sport-kabaddi.jpg"
              alt="Kabaddi raiders and defenders grappling in a tackle"
              index="N°02"
              caption="Kabaddi"
              parallax={40}
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="aspect-[4/4.5]"
            />
            <PhotoFrame
              src="/images/sport-football.jpg"
              alt="A footballer keeping the ball up in the air at training"
              index="N°04"
              caption="Football"
              parallax={22}
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="aspect-[4/4.5]"
            />
          </div>

          {/* The register plate — one full-width scoreboard strip */}
          <motion.div
            ref={plate.ref}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={plate.show ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-12 border border-pitch-line bg-pitch-2/60 rounded-[28px] px-6 sm:px-8 py-7 sm:py-8"
          >
            <p className="micro-label text-volt flex items-center gap-3">
              <span className="inline-block size-1.5 bg-volt" aria-hidden />
              The register keeps
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-5">
              {REGISTER_KEEPS.map((row) => (
                <li key={row.name} className="border-t border-pitch-line/70 pt-4">
                  <p className="display-poster text-bone text-[1.15rem] sm:text-[1.5rem] leading-none">
                    {row.name}
                  </p>
                  <p className="font-data text-[0.84rem] text-bone-2 mt-2.5 leading-snug">
                    {row.note}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* The widest close — athletics, full width */}
          <PhotoFrame
            src="/images/sport-athletics.jpg"
            alt="A sprinter striding on the track in training"
            index="N°05"
            caption="Athletics · the stride"
            parallax={34}
            sizes="100vw"
            className="lg:col-span-12 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/10]"
          />

          {/* The frame's data row — tight under the wide close */}
          <motion.div
            ref={dataRow.ref}
            initial={reduced ? false : { opacity: 0 }}
            animate={dataRow.show ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="lg:col-span-12 mt-4 flex flex-wrap items-baseline justify-between gap-4"
          >
            <span className="micro-label text-bone-2/80 !text-[0.6rem]">The ground</span>
            <span className="micro-label text-bone-2/80 !text-[0.6rem]">Dumka · Jharkhand</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
