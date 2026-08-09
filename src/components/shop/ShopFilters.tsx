"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CategoryIcon } from "@/components/shared/category-icon";
import { cn } from "@/lib/utils";

export interface CategoryFilter {
  slug: string;
  name: string;
  icon: string;
  count: number;
}

/** Serializes the current search params with overrides into a `?query` string. */
function buildQuery(
  params: URLSearchParams,
  overrides: Record<string, string | null>
): string {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  next.delete("page");
  const query = next.toString();
  return query ? `?${query}` : "";
}

function CategoryList({ categories }: { categories: CategoryFilter[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const hasActiveFilters = Boolean(activeCategory || searchParams.get("q"));
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  const allHref = `${pathname}${buildQuery(searchParams, { category: null })}`;
  const clearHref = `${pathname}${buildQuery(searchParams, {
    category: null,
    q: null,
  })}`;

  const rowClass = (isActive: boolean) =>
    cn(
      "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-primary font-medium text-primary-foreground"
        : "text-foreground/70 hover:bg-muted hover:text-foreground"
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Categories</h2>
        {hasActiveFilters && (
          <Link
            href={clearHref}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-1" role="radiogroup" aria-label="Categories">
        <Link
          href={allHref}
          role="radio"
          aria-checked={!activeCategory}
          className={rowClass(!activeCategory)}
        >
          <span className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border",
                !activeCategory ? "border-current" : "border-muted-foreground/40"
              )}
            >
              {!activeCategory && <span className="size-2 rounded-full bg-current" />}
            </span>
            All Products
          </span>
          <span className="text-xs opacity-80">{totalCount}</span>
        </Link>

        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          const href = `${pathname}${buildQuery(searchParams, {
            category: category.slug,
          })}`;

          return (
            <Link
              key={category.slug}
              href={href}
              role="radio"
              aria-checked={isActive}
              className={rowClass(isActive)}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    isActive ? "border-current" : "border-muted-foreground/40"
                  )}
                >
                  {isActive && <span className="size-2 rounded-full bg-current" />}
                </span>
                <CategoryIcon name={category.icon} className="size-4 shrink-0 opacity-80" />
                <span className="truncate">{category.name}</span>
              </span>
              <span className="text-xs opacity-80">{category.count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface ShopFiltersProps {
  categories: CategoryFilter[];
  variant: "desktop" | "mobile";
}

/**
 * Category filter sidebar. The "desktop" variant is a static aside shown on
 * large screens; the "mobile" variant is a slide-in sheet opened from a
 * "Filters" button.
 */
export function ShopFilters({ categories, variant }: ShopFiltersProps) {
  if (variant === "desktop") {
    return (
      <aside className="hidden lg:block">
        <div className="rounded-xl bg-card p-4 ring-1 ring-border">
          <CategoryList categories={categories} />
        </div>
      </aside>
    );
  }

  return (
    <Sheet>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "lg:hidden")}
      >
        <SlidersHorizontal className="size-4" />
        Filters
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-80">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <CategoryList categories={categories} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
