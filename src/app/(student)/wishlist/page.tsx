import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

import { requireStudent } from "@/lib/auth";
import { getWishlist } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import ProductGrid from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "My Wishlist — UniShop",
};

export default async function WishlistPage() {
  const user = await requireStudent();
  const wishlist = await getWishlist(user.id);

  const products = wishlist
    .map((item) => item.product)
    .filter((product): product is Product => !!product);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
        <p className="mt-1 text-muted-foreground">
          {wishlist.length === 0
            ? "Products you save will appear here."
            : `${wishlist.length} saved ${wishlist.length === 1 ? "item" : "items"}`}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Heart className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">
            Tap the heart on any product to save it here.
          </p>
          <Link href={ROUTES.shop} className={buttonVariants({ size: "lg" })}>
            Browse Shop
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
