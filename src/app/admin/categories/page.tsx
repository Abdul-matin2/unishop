import { getAllCategories, getAdminProducts } from "@/lib/db";
import { CategoryManager } from "./category-manager";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAdminProducts(),
  ]);

  const productCounts: Record<string, number> = {};
  for (const product of products) {
    productCounts[product.category_id] =
      (productCounts[product.category_id] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Categories</h1>
        <p className="mt-1 text-muted-foreground">
          Organize products across the marketplace with categories.
        </p>
      </div>

      <CategoryManager categories={categories} productCounts={productCounts} />
    </div>
  );
}
