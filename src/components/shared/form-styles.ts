/** Shared input styling: large, permanently labelled, clearly focused.
 *  Everything soft: xl inputs, pill buttons. No sharp corners. */
export const inputClass =
  "w-full h-[52px] px-4 bg-chalk border-[1.5px] border-line-2 rounded-xl text-[1rem] focus:border-green focus:outline-none focus:ring-[3px] focus:ring-green/25 disabled:opacity-60 transition-colors";

export const labelClass = "block text-[0.94rem] font-bold mb-1.5";

export const hintClass = "text-[0.82rem] text-ink-3 mt-1.5 leading-snug";

export const primaryBtn =
  "h-12 px-6 inline-flex items-center justify-center gap-2 bg-green hover:bg-green-2 text-chalk font-bold text-[0.94rem] rounded-full border-2 border-green-deep transition-colors disabled:opacity-70";

export const secondaryBtn =
  "h-12 px-6 inline-flex items-center justify-center gap-2 bg-chalk hover:bg-green-tint-2 text-ink font-bold text-[0.94rem] rounded-full border-[1.5px] border-line-2 transition-colors disabled:opacity-70";

export const dangerBtn =
  "h-12 px-6 inline-flex items-center justify-center gap-2 bg-red hover:bg-[#993121] text-chalk font-bold text-[0.94rem] rounded-full border-2 border-[#7d2a1c] transition-colors disabled:opacity-70";

/** Quiet destructive: outlined, not filled — for passive screens like Profile. */
export const quietDangerBtn =
  "h-12 px-6 inline-flex items-center justify-center gap-2 bg-transparent text-red font-bold text-[0.94rem] rounded-full border-[1.5px] border-red/60 hover:bg-red-tint transition-colors disabled:opacity-70";
