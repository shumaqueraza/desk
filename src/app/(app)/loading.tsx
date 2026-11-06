import { Loader2 } from "lucide-react";

/**
 * Route-level loading state. Mirrors the shapes of the pages behind it:
 * a headline, a ruled stat band with a dark ready segment, and register rows.
 */
export default function AppLoading() {
  return (
    <div aria-busy="true" aria-label="Loading the register">
      <div className="mb-7">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-data text-[0.75rem] tracking-[0.14em] text-green font-semibold">
              OPENING THE REGISTER
            </p>
            <h1 className="font-display font-extrabold text-[1.85rem] sm:text-[2.15rem] leading-tight tracking-tight mt-1 flex items-center gap-3">
              One moment
              <Loader2 className="size-6 text-green animate-spin" aria-hidden />
            </h1>
          </div>
        </div>
        <div className="rule-double mt-5" aria-hidden />
      </div>

      {/* Stat band skeleton */}
      <div className="bg-chalk border border-line rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-5">
            <div className="h-3 w-24 bg-green-tint rounded animate-pulse" />
            <div className="h-10 w-16 bg-green-tint rounded mt-3 animate-pulse" />
            <div className="h-3 w-20 bg-green-tint rounded mt-3 animate-pulse" />
          </div>
        ))}
        <div className="pitch-surface p-5">
          <div className="h-3 w-24 bg-chalk/25 rounded animate-pulse" />
          <div className="h-10 w-16 bg-chalk/25 rounded mt-3 animate-pulse" />
          <div className="h-3 w-24 bg-chalk/25 rounded mt-3 animate-pulse" />
        </div>
      </div>

      {/* Register rows skeleton */}
      <div className="grid lg:grid-cols-12 gap-6 mt-6 items-start">
        <div className="lg:col-span-7 bg-chalk border border-line rounded-2xl p-5 space-y-4" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="size-9 bg-green-tint rounded animate-pulse" />
              <div className="h-4 flex-1 bg-green-tint rounded animate-pulse" style={{ maxWidth: `${70 - i * 8}%` }} />
              <div className="h-6 w-20 bg-green-tint rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-5 space-y-6" aria-hidden>
          <div className="bg-chalk border border-line rounded-2xl p-5 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="size-9 bg-green-tint rounded animate-pulse" />
                <div className="h-4 flex-1 bg-green-tint rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="bg-chalk border border-line rounded-2xl p-5 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="size-9 bg-green-tint rounded animate-pulse" />
                <div className="h-4 flex-1 bg-green-tint rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
