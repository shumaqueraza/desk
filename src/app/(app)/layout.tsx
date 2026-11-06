import { Masthead, BottomTabs } from "@/components/app/masthead";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex-1 flex flex-col min-h-svh">
      <Masthead user={user} />
      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-32 md:pb-12">
        {children}
      </main>
      <BottomTabs role={user.role} />
    </div>
  );
}
