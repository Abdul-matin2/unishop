"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  removeFromCart,
  updateCartQuantity,
} from "@/lib/actions/cart.actions";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

interface CartLineProps {
  item: CartItem;
}

/**
 * One cart row: product image/link, quantity stepper, line total, and a
 * remove button. Quantity and removal persist through the cart actions and
 * refresh the cart page afterwards. Decreasing below 1 removes the row.
 */
export function CartLine({ item }: CartLineProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const product = item.product;
  if (!product) return null;

  const max = product.stock_quantity || 99;

  const changeQuantity = async (delta: number) => {
    if (pending) return;
    const next = item.quantity + delta;

    if (next <= 0) {
      setPending(true);
      const result = await removeFromCart(item.id);
      setPending(false);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Item removed from cart.");
      router.refresh();
      return;
    }

    if (next > max) return;

    setPending(true);
    const result = await updateCartQuantity(item.id, next);
    setPending(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  };

  const remove = async () => {
    if (pending) return;
    setPending(true);
    const result = await removeFromCart(item.id);
    setPending(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Item removed from cart.");
    router.refresh();
  };

  return (
    <div className="flex gap-4 p-4">
      <Link
        href={ROUTES.product(product.slug)}
        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={ROUTES.product(product.slug)}
              className="line-clamp-1 text-sm font-medium hover:text-primary"
            >
              {product.title}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatPrice(product.price)} each
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label={`Remove ${product.title} from cart`}
            className="shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex items-center rounded-lg border border-input">
            <button
              type="button"
              onClick={() => changeQuantity(-1)}
              disabled={pending}
              aria-label="Decrease quantity"
              className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => changeQuantity(1)}
              disabled={pending || item.quantity >= max}
              aria-label="Increase quantity"
              className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <span className="text-sm font-semibold">
            {formatPrice(product.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartLine;
