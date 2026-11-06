import { LandingShell } from "@/components/landing/shell";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { SportsSection } from "@/components/landing/sports";
import { ClosingSection } from "@/components/landing/closing";
import { getCurrentUser } from "@/lib/auth";

/**
 * The public page: identity, one striking introduction, the sports of the
 * academy, and the door into the desk. Nothing else — the register itself
 * lives inside the application.
 */
export default async function LandingPage() {
  const user = await getCurrentUser();
  const href = user ? "/dashboard" : "/login";
  const label = user ? "Open my desk" : "Sign in";

  return (
    <LandingShell>
      <LandingNav href={href} label={label} />
      <main className="flex-1">
        <Hero href={href} label={label} />
        <SportsSection />
        <ClosingSection href={href} label={label} />
      </main>
    </LandingShell>
  );
}
