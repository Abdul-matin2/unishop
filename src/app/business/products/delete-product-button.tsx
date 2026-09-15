"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { permanentlyDeleteProduct } from "@/lib/actions/product.actions";

interface DeleteProductButtonProps {
  productId: string;
  productTitle: string;
}

/**
 * Destructive, hard-delete control for the seller dashboard. Confirms with
 * the user before removing the product permanently.
 */
export function DeleteProductButton({
  productId,
  productTitle,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${productTitle}" permanently? This cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await permanentlyDeleteProduct(productId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${productTitle}" deleted.`);
        router.refresh();
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${productTitle}`}
    >
      <Trash2 />
    </Button>
  );
}

export default DeleteProductButton;