import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getProducts } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import ProductCard from "@/components/product/ProductCard";

export async function FeaturedProducts() {
  const { products } = await getProducts({ featured: true, limit: 4 });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">
            Handpicked for you
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Featured Products
          </h2>
        </div>
        <Link
          href={ROUTES.shop}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View All Products
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
