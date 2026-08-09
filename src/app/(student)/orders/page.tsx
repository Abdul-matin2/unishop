import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Package } from "lucide-react";

import { requireStudent } from "@/lib/auth";
import { getOrdersByBuyer } from "@/lib/db";
import { ORDER_STATUSES, ROUTES } from "@/lib/constants";
import { openOrderThread } from "@/lib/actions/message.actions";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const metadata: Metadata = {
  title: "My Orders — UniShop",
};

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

const TABS = [
  { value: "all", label: "All" },
  ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label })),
];

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status } = await searchParams;
  const user = await requireStudent();
  const orders = await getOrdersByBuyer(user.id);

  const selected = status && TABS.some((t) => t.value === status) ? status : "all";
  const filtered =
    selected === "all"
      ? orders
      : orders.filter((order) => order.status === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Track and manage your purchases on UniShop.
        </p>
      </div>

      {/* Status filter tabs */}
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const active = selected === tab.value;
          const href =
            tab.value === "all" ? "/orders" : `/orders?status=${tab.value}`;
          return (
            <Link
              key={tab.value}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Package className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium">
            {orders.length === 0 ? "No orders yet" : "No orders in this status"}
          </p>
          <p className="text-sm text-muted-foreground">
            {orders.length === 0
              ? "When you place your first order, it will show up here."
              : "Try another status filter."}
          </p>
          <Link
            href={ROUTES.shop}
            className={buttonVariants({ size: "lg" })}
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const items = order.items ?? [];
            // Distinct sellers in this order (for the Message Seller buttons).
            const sellers = Array.from(
              items
                .reduce((map, item) => {
                  if (!map.has(item.business_id)) {
                    map.set(item.business_id, {
                      id: item.business_id,
                      name: item.seller_business_name,
                    });
                  }
                  return map;
                }, new Map<string, { id: string; name: string }>())
                .values()
            );

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl bg-card ring-1 ring-border"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Placed {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Items */}
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3 sm:px-6"
                    >
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
                        <p className="truncate text-xs text-muted-foreground">
                          {item.seller_business_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} · {formatPrice(item.unit_price)}{" "}
                          each
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-6">
                  <div className="flex flex-wrap gap-2">
                    {sellers.map((seller) => (
                      <form key={seller.id} action={openOrderThread}>
                        <input
                          type="hidden"
                          name="orderId"
                          value={order.id}
                        />
                        <input
                          type="hidden"
                          name="businessId"
                          value={seller.id}
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <MessageSquare className="size-3.5" />
                          Message {seller.name}
                        </button>
                      </form>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Total:{" "}
                      <span className="font-semibold text-foreground">
                        {formatPrice(order.total)}
                      </span>
                    </span>
                    <Link
                      href={ROUTES.order(order.id)}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
