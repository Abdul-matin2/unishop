import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getOrderById } from "@/lib/db";
import { ROUTES, ORDER_STATUSES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Order Confirmation — UniShop",
  robots: { index: false },
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  if (!id) notFound();

  const order = await getOrderById(id);
  if (!order) notFound();

  const status = ORDER_STATUSES.find((s) => s.value === order.status);
  const items = order.items ?? [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-14 sm:px-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="size-9" />
      </div>

      <h1 className="mt-4 text-center text-2xl font-bold tracking-tight sm:text-3xl">
        Order Placed Successfully!
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Thanks for your order. A confirmation has been sent to your email.
      </p>

      <p className="mt-4 rounded-full bg-muted px-4 py-1.5 text-sm">
        Order number:{" "}
        <span className="font-semibold">{order.order_number}</span>
      </p>

      <Card className="mt-8 w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Order Details</CardTitle>
          {status && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                status.color
              )}
            >
              {status.label}
            </span>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.product_image_url && (
                    <Image
                      src={item.product_image_url}
                      alt={item.product_title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">
                    {item.product_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} · {formatPrice(item.unit_price)} each
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-medium">Total</span>
              <span className="font-semibold">{formatPrice(order.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment method</span>
              <span className="font-medium">Cash on Pickup</span>
            </div>
            {order.shipping_address && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-right font-medium">
                  {order.shipping_address}
                </span>
              </div>
            )}
            {order.contact_phone && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Contact phone</span>
                <span className="font-medium">{order.contact_phone}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Notes</span>
                <span className="text-right font-medium">{order.notes}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href={ROUTES.shop} className={buttonVariants({ size: "lg" })}>
          Continue Shopping
        </Link>
        <Link
          href={ROUTES.studentOrders}
          className={buttonVariants({ variant: "ghost" })}
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}
