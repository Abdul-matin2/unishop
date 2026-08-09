import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { requireBusiness } from "@/lib/auth";
import { updateProduct } from "@/lib/actions/product.actions";
import { getCategories, getProductsByBusiness } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { ProductForm } from "../../new/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const user = await requireBusiness();

  const [products, categories] = await Promise.all([
    getProductsByBusiness(user.id),
    getCategories(),
  ]);

  const product = products.find((p) => p.id === id);
  if (!product) notFound();

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
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="mt-1 text-muted-foreground">
          Update the details for &quot;{product.title}&quot; below.
        </p>
      </div>

      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        initial={product}
      />
    </div>
  );
}
