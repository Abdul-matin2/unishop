import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Banknote,
  Check,
  ChevronRight,
  GraduationCap,
  MapPin,
  MessageSquare,
  Star,
  StarHalf,
  Truck,
  X,
} from "lucide-react";

import { getProduct, getProductReviews, getProducts } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Product, Review } from "@/lib/types";
import { openProductThread } from "@/lib/actions/message.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ReviewForm } from "@/components/product/ReviewForm";
import ProductGrid from "@/components/product/ProductGrid";
import { ProductActions } from "@/components/product/ProductActions";

const CONDITION_LABELS: Record<Product["condition"], string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  used: "Used",
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: "Product Not Found — UniShop" };
  }
  return {
    title: `${product.title} — UniShop`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const category = product.category;
  const [reviews, recommendationsResult] = await Promise.all([
    getProductReviews(product.id),
    getProducts({ category: product.category?.slug, limit: 4 }),
  ]);
  const recommendations = recommendationsResult.products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const inStock = product.stock_quantity > 0;
  const galleryImages =
    product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
        ? [product.image_url]
        : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href={ROUTES.home} className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link
          href={category ? `/shop?category=${category.slug}` : ROUTES.shop}
          className="transition-colors hover:text-foreground"
        >
          {category?.name ?? "Shop"}
        </Link>
        <ChevronRight className="size-4" />
        <span className="line-clamp-1 font-medium text-foreground">
          {product.title}
        </span>
      </nav>

      {/* Main product layout */}
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={galleryImages} alt={product.title} />

        <div className="flex flex-col gap-5">
          <div>
            {category && (
              <Badge variant="secondary" className="mb-3">
                <Link href={`/shop?category=${category.slug}`}>{category.name}</Link>
              </Badge>
            )}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {product.title}
            </h1>
            <div className="mt-2 flex items-center gap-1.5">
              <RatingSummary rating={product.rating_avg} count={product.rating_count} />
            </div>
          </div>

          <Separator />

          {/* Price */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.original_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
                <Badge variant="destructive">Sale</Badge>
              </>
            )}
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Condition + stock */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {CONDITION_LABELS[product.condition]}
            </Badge>
            {inStock ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                <Check className="size-4" />
                In Stock ({product.stock_quantity} left)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-destructive">
                <X className="size-4" />
                Out of Stock
              </span>
            )}
          </div>

          <Separator />

          {/* Call / WhatsApp the seller directly — per-listing numbers, falling back
          to the business phone for legacy rows. */}
          <ProductActions
            whatsappNumber={
              product.whatsapp_number ?? product.business?.phone ?? null
            }
            callNumber={product.call_number ?? product.business?.phone ?? null}
            businessName={product.business?.business_name ?? null}
            productTitle={product.title}
          />

          {/* Ask the seller a question */}
          <form action={openProductThread} className="w-full">
            <input type="hidden" name="businessId" value={product.business_id} />
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="productSlug" value={product.slug} />
            <input
              type="hidden"
              name="subject"
              value={`Question about: ${product.title}`}
            />
            <Button type="submit" variant="outline" className="w-full">
              <MessageSquare className="size-4" />
              Ask {product.business?.business_name ?? "Seller"} a Question
            </Button>
          </form>

          {/* Perks */}
          <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4 text-sm">
            {product.location && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                Located at {product.location}
              </p>
            )}
            {product.institution && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="size-4" />
                {product.institution}
              </p>
            )}
            <p className="flex items-center gap-2 text-muted-foreground">
              <Truck className="size-4" />
              Pickup or local delivery options available at checkout.
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Banknote className="size-4" />
              Cash on pickup accepted.
            </p>
          </div>
        </div>
      </div>

      {/* Description / Reviews tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList variant="line" className="w-full justify-start gap-2">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-5">
          <div className="rounded-xl bg-card p-6 ring-1 ring-border">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <p className="rounded-xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-border">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <ReviewForm productId={product.id} productSlug={product.slug} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Same-category recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wider text-primary uppercase">
                You might also like
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
                More in {category?.name ?? "this category"}
              </h2>
            </div>
            <Link
              href={category ? `/shop?category=${category.slug}` : ROUTES.shop}
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={recommendations} />
          </div>
        </section>
      )}
    </div>
  );
}

/** Star rating with an adjacent numeric value and review count. */
function RatingSummary({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <ReviewStars rating={rating} />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">
        ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

/** Small star row used for reviews and the rating summary. */
function ReviewStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.min(Math.max(rating - index, 0), 1);
        if (fill >= 0.75) {
          return <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />;
        }
        if (fill >= 0.25) {
          return <StarHalf key={index} className="size-3.5 fill-amber-400 text-amber-400" />;
        }
        return <Star key={index} className="size-3.5 text-muted-foreground/30" />;
      })}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const name =
    review.user?.full_name ?? `Student ${review.user_id.slice(-2).toUpperCase()}`;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const date = formatDate(review.created_at);
  const avatarUrl = review.user?.avatar_url;

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <ReviewStars rating={review.rating} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {review.comment}
      </p>
    </div>
  );
}
