"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";

import { addToCart } from "@/lib/actions/cart.actions";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  productId: string;
  stockQuantity: number;
}

/**
 * Quantity stepper plus Add to Cart / Buy Now controls for the product page.
 * Both actions go through `addToCart`; Buy Now then navigates to checkout.
 */
export function ProductActions({ productId, stockQuantity }: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(null);

  const inStock = stockQuantity > 0;
  const max = stockQuantity;

  const handleAddToCart = async () => {
    setPendingAction("add");
    try {
      const result = await addToCart(productId, quantity);
      if (result.error) {
        toast.error(result.error);
        if (result.error.toLowerCase().includes("log in")) {
          router.push(ROUTES.login);
        }
        return;
      }
      toast.success("Added to cart.");
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  };

  const handleBuyNow = async () => {
    setPendingAction("buy");
    try {
      const result = await addToCart(productId, quantity);
      if (result.error) {
        toast.error(result.error);
        if (result.error.toLowerCase().includes("log in")) {
          router.push(ROUTES.login);
        }
        return;
      }
      router.push(ROUTES.checkout);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-2 text-sm font-medium">Quantity</p>
        <div className="flex w-fit items-center rounded-lg border border-input">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1 || pendingAction !== null}
            aria-label="Decrease quantity"
            className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(max, value + 1))}
            disabled={quantity >= max || pendingAction !== null}
            aria-label="Increase quantity"
            className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {inStock ? (
          <>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={pendingAction !== null}
            >
              <ShoppingCart className="size-4" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={pendingAction !== null}
            >
              <Zap className="size-4" />
              Buy Now
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" className="flex-1" disabled>
              <ShoppingCart className="size-4" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1" disabled>
              Buy Now
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductActions;
