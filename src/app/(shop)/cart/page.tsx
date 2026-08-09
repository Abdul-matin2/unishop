import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

import { requireStudent } from "@/lib/auth";
import { getCart } from "@/lib/db";
import { CartLine } from "@/components/cart/cart-line";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TAX_RATE = 0.08;

export default async function CartPage() {
  const user = await requireStudent();
  const cartItems = await getCart(user.id);
  const items = cartItems.filter((item) => item.product);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="size-9 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything to your cart yet. Start
          browsing the marketplace to find what you need.
        </p>
        <Link
          href={ROUTES.shop}
          className={buttonVariants({ size: "lg", className: "mt-2" })}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Shopping Cart
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"} in your cart
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Cart items */}
        <Card className="py-0">
          <CardContent className="flex flex-col px-0">
            {items.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <Separator />}
                <CartLine item={item} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Estimated tax (8%)
                </span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-semibold">
                  {formatPrice(total)}
                </span>
              </div>
              <Link
                href={ROUTES.checkout}
                className={buttonVariants({
                  size: "lg",
                  className: "mt-1 w-full",
                })}
              >
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={ROUTES.shop}
                className="text-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Continue Shopping
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
