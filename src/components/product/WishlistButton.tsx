"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart } from "lucide-react";

import { toggleWishlist } from "@/lib/actions/wishlist.actions";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  /** When known (e.g. the wishlist page), skip the client-side lookup. */
  initialWishlisted?: boolean;
  className?: string;
}

export function WishlistButton({
  productId,
  initialWishlisted,
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState<boolean>(initialWishlisted ?? false);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Resolve the initial state on the client (skip when provided).
  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;
      setUserId(user?.id ?? null);

      if (user && initialWishlisted === undefined) {
        const { data } = await supabase
          .from("wishlist_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .maybeSingle();
        if (!cancelled) setWishlisted(!!data);
      }
      if (!cancelled) setLoaded(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [productId, initialWishlisted]);

  const handleToggle = async (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!loaded) return;

    if (!userId) {
      toast.error("Please log in to save items to your wishlist.");
      router.push(ROUTES.login);
      return;
    }

    setPending(true);
    try {
      const result = await toggleWishlist(productId);
      if (result.error) {
        toast.error(result.error);
        if (result.error.toLowerCase().includes("log in")) {
          router.push(ROUTES.login);
        }
        return;
      }
      setWishlisted(result.inWishlist ?? !wishlisted);
      toast.success(
        result.inWishlist
          ? "Saved to your wishlist."
          : "Removed from your wishlist."
      );
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background disabled:opacity-60",
        wishlisted ? "text-rose-500" : "text-muted-foreground hover:text-rose-500",
        className
      )}
    >
      <Heart
        className={cn("size-4", wishlisted && "fill-current")}
        strokeWidth={2}
      />
    </button>
  );
}
