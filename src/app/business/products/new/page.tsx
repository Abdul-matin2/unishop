import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createProduct } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { ProductForm } from "./product-form";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.businessProducts}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to My Products
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
        <p className="mt-1 text-muted-foreground">
          Fill in the details below to list a new product on UniShop.
        </p>
      </div>

      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
