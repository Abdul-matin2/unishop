"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShopFilters,
  type CategoryFilter,
} from "@/components/shop/ShopFilters";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

interface ShopToolbarProps {
  count: number;
  categories: CategoryFilter[];
}

export function ShopToolbar({ count, categories }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "newest";
  const view = searchParams.get("view") === "list" ? "list" : "grid";

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    if (params.get("sort") === "newest") params.delete("sort");
    const query = params.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  };

  const viewHref = (nextView: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (nextView === "grid") {
      params.delete("view");
    } else {
      params.set("view", "list");
    }
    if (params.get("sort") === "newest") params.delete("sort");
    const query = params.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{count}</span>{" "}
        {count === 1 ? "product" : "products"}
      </p>

      <div className="flex items-center gap-2">
        {/* Search */}
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateParams({ q: String(formData.get("q") ?? "").trim() });
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="Search products..."
            aria-label="Search products"
            className="h-9 w-36 rounded-lg border border-input bg-transparent pr-2 pl-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:w-52"
          />
        </form>

        {/* Mobile filters */}
        <ShopFilters variant="mobile" categories={categories} />

        {/* Sort */}
        <Select
          value={sort}
          onValueChange={(value) => updateParams({ sort: String(value) })}
        >
          <SelectTrigger aria-label="Sort products" className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grid / list toggle */}
        <div className="hidden items-center rounded-lg border border-border p-0.5 sm:flex">
          <Link
            href={viewHref("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={cn(
              buttonVariants({
                variant: view === "grid" ? "secondary" : "ghost",
                size: "icon-sm",
              })
            )}
          >
            <LayoutGrid className="size-4" />
          </Link>
          <Link
            href={viewHref("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={cn(
              buttonVariants({
                variant: view === "list" ? "secondary" : "ghost",
                size: "icon-sm",
              })
            )}
          >
            <List className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
