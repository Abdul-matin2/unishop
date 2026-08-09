import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";

const stats = [
  { value: "500+", label: "Products" },
  { value: "50+", label: "Businesses" },
  { value: "10,000+", label: "Students" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-indigo-50/40 to-background">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-16 size-96 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-violet-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Everything You Need for{" "}
            <span className="text-primary">Campus Life</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Shop from trusted businesses, find textbooks, electronics, food,
            and more — all at student-friendly prices.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.shop}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full px-8 sm:w-auto"
              )}
            >
              Start Shopping
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={ROUTES.signup}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full px-8 sm:w-auto"
              )}
            >
              <Store className="size-4" />
              Sell on UniShop
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-card/70 px-6 py-5 text-center ring-1 ring-foreground/10 backdrop-blur"
            >
              <p className="text-3xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
