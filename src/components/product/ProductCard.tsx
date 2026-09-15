"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, ShoppingBag } from "lucide-react";

import type { Product } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import { buildWhatsAppHref, cn, telHref } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import RatingStars from "@/components/product/RatingStars";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WishlistButton } from "@/components/product/WishlistButton";

const priceFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const categoryName = product.category?.name ?? "General";
  const onSale =
    product.original_price != null && product.original_price > product.price;
  const discountPercent = onSale
    ? Math.round(
        ((product.original_price! - product.price) / product.original_price!) *
          100
      )
    : null;

  // Contact the seller directly — no cart/checkout in the buyer flow. Prefer
  // the per-listing numbers, falling back to the business phone for legacy rows.
  const whatsappNumber =
    product.whatsapp_number ?? product.business?.phone ?? null;
  const callNumber = product.call_number ?? product.business?.phone ?? null;
  const phoneHref = callNumber ? telHref(callNumber) : null;
  const whatsappHref = whatsappNumber
    ? buildWhatsAppHref(
        whatsappNumber,
        `Hi — I'm interested in "${product.title}" on UniShop. Is it still available?`
      )
    : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Image + category badge */}
      <Link
        href={ROUTES.product(product.slug)}
        className="relative block aspect-square w-full overflow-hidden bg-muted"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="size-8" />
          </span>
        )}

        <WishlistButton
          productId={product.id}
          className="absolute top-2 right-2"
        />

        {discountPercent != null && (
          <span className="absolute top-2 left-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-white">
            -{discountPercent}%
          </span>
        )}

        <Badge className="absolute bottom-2 left-2 bg-background/90 text-foreground backdrop-blur">
          {categoryName}
        </Badge>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={ROUTES.product(product.slug)}
          className="focus-visible:outline-none"
        >
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        <RatingStars rating={product.rating_avg} count={product.rating_count} />

        {product.location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{product.location}</span>
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>
      </div>

      {/* Actions — call or WhatsApp the seller directly */}
      <div className="flex gap-2 p-4 pt-0">
        <a
          href={phoneHref ?? undefined}
          tabIndex={phoneHref ? undefined : -1}
          aria-disabled={!phoneHref || undefined}
          title={
            phoneHref ? undefined : "This seller has not added a phone number yet"
          }
          className={cn(
            buttonVariants({ variant: "outline" }),
            "flex-1",
            !phoneHref && "pointer-events-none opacity-50"
          )}
        >
          <Phone className="size-4" />
          Call Seller
        </a>
        <a
          href={whatsappHref ?? undefined}
          tabIndex={whatsappHref ? undefined : -1}
          aria-disabled={!whatsappHref || undefined}
          title={
            whatsappHref ? undefined : "This seller has not added a phone number yet"
          }
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default" }),
            "flex-1 bg-[#25D366] text-white hover:bg-[#1DA851]",
            !whatsappHref && "pointer-events-none opacity-50"
          )}
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export default ProductCard;