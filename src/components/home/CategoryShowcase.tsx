import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getCategories } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";

export async function CategoryShowcase() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">
            Shop by
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Browse by Category
          </h2>
        </div>
        <Link
          href={ROUTES.shop}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all products
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group"
          >
            <div className="flex h-full flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:ring-primary/30">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <CategoryIcon name={category.icon} className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold leading-snug">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Shop now</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryShowcase;
