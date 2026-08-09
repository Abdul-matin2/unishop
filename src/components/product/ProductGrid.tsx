import { Package } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

/**
 * Responsive grid of ProductCards (1 col mobile, 2 cols tablet, 3 cols
 * desktop). Renders a friendly empty state when no products are passed.
 */
export default function ProductGrid({
  products,
  emptyMessage,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Package className="size-6 text-muted-foreground" />
        </div>
        <p className="font-medium">{emptyMessage ?? "No products found"}</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
