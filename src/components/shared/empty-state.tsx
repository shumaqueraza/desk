import type { LucideIcon } from "lucide-react";

/** Dashed-border empty state with one clear sentence and one clear action. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-[1.5px] border-dashed border-line-2 rounded-2xl bg-chalk/60 px-6 py-12 sm:py-16 text-center">
      <Icon className="size-9 text-ink-3 mx-auto" strokeWidth={1.8} aria-hidden />
      <h3 className="font-bold text-[1.15rem] mt-4">{title}</h3>
      <p className="text-ink-2 text-[0.95rem] mt-1.5 max-w-md mx-auto leading-relaxed">{body}</p>
      {children && <div className="mt-6 flex justify-center gap-3 flex-wrap">{children}</div>}
    </div>
  );
}
