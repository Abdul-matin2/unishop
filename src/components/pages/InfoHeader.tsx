import type { ReactNode } from "react";

interface InfoHeaderProps {
  /** Page title shown in the gradient band. */
  title: string;
  /** One-line summary under the title. */
  subtitle?: string;
  /** Lucide icon displayed beside the title. */
  icon: ReactNode;
}

/**
 * Shared hero header for the top-level info pages (About, Contact, FAQ,
 * Help Center, Shipping, Returns, Privacy). Mirrors the home Hero visuals.
 */
export function InfoHeader({ title, subtitle, icon }: InfoHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-indigo-50/40 to-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 size-96 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-violet-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:flex">
            {icon}
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InfoHeader;