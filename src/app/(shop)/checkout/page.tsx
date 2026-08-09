import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Banknote, MapPin, StickyNote, User } from "lucide-react";

import { requireStudent } from "@/lib/auth";
import { getCart } from "@/lib/db";
import { placeOrder } from "@/lib/actions/checkout.actions";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const TAX_RATE = 0.08;

export default async function CheckoutPage() {
  const user = await requireStudent();
  const cartItems = await getCart(user.id);
  const items = cartItems.filter((item) => item.product);

  if (items.length === 0) {
    redirect(ROUTES.cart);
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Almost done — just a few details to finalize your order.
      </p>

      <form
        action={async (formData: FormData) => {
          "use server";
          await placeOrder(formData);
        }}
        className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="flex flex-col gap-6">
          {/* Contact */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <User className="size-4 text-muted-foreground" />
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Full name</Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  autoComplete="name"
                  defaultValue={user.full_name ?? ""}
                  placeholder="Your name"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={user.phone ?? ""}
                  placeholder="(555) 123-4567"
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <MapPin className="size-4 text-muted-foreground" />
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="shipping_address">Address</Label>
                <Input
                  id="shipping_address"
                  name="shipping_address"
                  autoComplete="street-address"
                  required
                  placeholder="123 University Ave, North Dorm"
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Banknote className="size-4 text-muted-foreground" />
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
                <input
                  type="radio"
                  name="payment"
                  value="cash-on-pickup"
                  defaultChecked
                  className="mt-0.5 size-4 accent-primary"
                />
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Cash on Pickup</span>
                  <span className="text-sm text-muted-foreground">
                    Pay in person when you pick up your order. This is the only
                    available payment option for now.
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Order notes */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <StickyNote className="size-4 text-muted-foreground" />
              <CardTitle>
                Order Notes{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                rows={4}
                placeholder="Add any notes for the seller (e.g., meetup time, dorm location)…"
              />
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className={buttonVariants({ size: "lg", className: "w-full" })}
              >
                Place Order
              </button>
              <Link
                href={ROUTES.cart}
                className="text-center text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Back to cart
              </Link>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
