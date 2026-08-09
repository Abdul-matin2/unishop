import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { getCategories, getCategoryCounts, getProducts } from "@/lib/db";
import type { Product } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import RatingStars from "@/components/product/RatingStars";
import ProductGrid from "@/components/product/ProductGrid";
import { ShopFilters, type CategoryFilter } from "@/components/shop/ShopFilters";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Shop — UniShop",
  description:
    "Browse textbooks, electronics, fashion, food and more from campus businesses at student-friendly prices.",
};

type ShopSearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
  view?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeCategorySlug = params.category ?? null;
  const sort = params.sort ?? "newest";
  const view = params.view === "list" ? "list" : "grid";

  const currentPage = Math.max(
    1,
    Number.parseInt(params.page ?? "1", 10) || 1
  );

  const [productResult, categories, categoryCounts] = await Promise.all([
    getProducts({
      query: query || undefined,
      category: activeCategorySlug ?? undefined,
      sort,
      page: currentPage,
    }),
    getCategories(),
    getCategoryCounts(),
  ]);

  const { total, totalPages } = productResult;
  let { products } = productResult;

  // Clamp the page number to the last available page so stale/deep links
  // still render products instead of an empty grid.
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  if (safePage !== currentPage) {
    const clamped = await getProducts({
      query: query || undefined,
      category: activeCategorySlug ?? undefined,
      sort,
      page: safePage,
    });
    products = clamped.products;
  }

  const categoryFilters: CategoryFilter[] = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    icon: category.icon ?? "",
    count: categoryCounts[category.id] ?? 0,
  }));

  // Preserved query params for pagination links
  const baseQuery = new URLSearchParams();
  if (params.q) baseQuery.set("q", params.q);
  if (params.category) baseQuery.set("category", params.category);
  if (params.sort) baseQuery.set("sort", params.sort);
  if (params.view) baseQuery.set("view", params.view);

  const pageHref = (page: number) => {
    const next = new URLSearchParams(baseQuery);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    const queryString = next.toString();
    return queryString ? `/shop?${queryString}` : "/shop";
  };

  const pageItems: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page++) pageItems.push(page);
  } else {
    pageItems.push(1);
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    if (start > 2) pageItems.push("ellipsis");
    for (let page = start; page <= end; page++) pageItems.push(page);
    if (end < totalPages - 1) pageItems.push("ellipsis");
    pageItems.push(totalPages);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Shop</h1>
        <p className="text-sm text-muted-foreground">
          Discover products from campus businesses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Desktop filters */}
        <Suspense
          fallback={
            <div className="hidden lg:block">
              <div className="h-72 rounded-xl bg-muted/50" />
            </div>
          }
        >
          <ShopFilters variant="desktop" categories={categoryFilters} />
        </Suspense>

        <div className="min-w-0">
          <Suspense
            fallback={
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 rounded bg-muted/60" />
                <div className="h-9 w-64 rounded-lg bg-muted/60" />
              </div>
            }
          >
            <ShopToolbar count={total} categories={categoryFilters} />
          </Suspense>

          <div className="mt-6">
            {products.length === 0 ? (
              <ProductGrid products={[]} emptyMessage="No products found" />
            ) : view === "grid" ? (
              <ProductGrid products={products} />
            ) : (
              <ProductList products={products} />
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={pageHref(Math.max(1, safePage - 1))}
                      className={safePage === 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>

                  {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href={pageHref(item)}
                          isActive={item === safePage}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href={pageHref(Math.min(totalPages, safePage + 1))}
                      className={safePage === totalPages ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Horizontal product rows for "list" view. */
function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="flex flex-col gap-4">
      {products.map((product) => {
        const category = product.category;
        return (
          <Link
            key={product.id}
            href={ROUTES.product(product.slug)}
            className="group flex gap-4 rounded-xl bg-card p-4 ring-1 ring-border transition hover:shadow-md"
          >
            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="truncate text-xs text-muted-foreground">
                {category?.name ?? "General"}
              </p>
              <h3 className="line-clamp-1 font-medium group-hover:text-primary">
                {product.title}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                <RatingStars
                  rating={product.rating_avg}
                  count={product.rating_count}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
