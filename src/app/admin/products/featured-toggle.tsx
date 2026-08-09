"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Power } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell } from "@/components/ui/table";
import { toggleFeatured } from "@/lib/actions/admin.actions";
import {
  deleteProduct,
  setProductActive,
} from "@/lib/actions/product.actions";
import type { Product } from "@/lib/types";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [featured, setFeatured] = useState(product.is_featured);
  const [active, setActive] = useState(product.is_active);

  const handleFeaturedChange = (checked: boolean) => {
    setFeatured(checked);
    startTransition(async () => {
      const result = await toggleFeatured(product.id, checked);
      if (result.error) {
        setFeatured((value) => !value);
        toast.error(result.error);
      } else {
        toast.success(checked ? "Product featured" : "Product unfeatured");
        router.refresh();
      }
    });
  };

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = active
        ? await deleteProduct(product.id)
        : await setProductActive(product.id, true);
      if (result.error) {
        toast.error(result.error);
      } else {
        setActive((value) => !value);
        toast.success(active ? "Product deactivated" : "Product activated");
        router.refresh();
      }
    });
  };

  return (
    <>
      <TableCell>
        <Switch
          checked={featured}
          onCheckedChange={handleFeaturedChange}
          disabled={isPending}
          aria-label={`Toggle featured for ${product.title}`}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          disabled={isPending}
          onClick={handleToggleActive}
        >
          <Power />
          {active ? "Deactivate" : "Activate"}
        </Button>
      </TableCell>
    </>
  );
}
