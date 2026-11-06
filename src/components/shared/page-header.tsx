/** Consistent page title block with a register double rule. */
export function PageHeader({
  kicker,
  title,
  sub,
  children,
}: {
  kicker?: string;
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {kicker && (
            <p className="font-data text-[0.75rem] tracking-[0.14em] text-green font-semibold">
              {kicker}
            </p>
          )}
          <h1 className="font-display font-extrabold text-[1.85rem] sm:text-[2.15rem] leading-tight tracking-tight mt-1">
            {title}
          </h1>
          {sub && <p className="text-ink-2 text-[0.98rem] mt-1.5 max-w-[44rem]">{sub}</p>}
        </div>
        {children && <div className="flex flex-wrap gap-3 shrink-0">{children}</div>}
      </div>
      <div className="rule-double mt-5" aria-hidden />
    </div>
  );
}
