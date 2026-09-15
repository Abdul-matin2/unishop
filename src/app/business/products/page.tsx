import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Power, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "./delete-product-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireBusiness } from "@/lib/auth";
import {
  deleteProduct,
  setProductActive,
} from "@/lib/actions/product.actions";
import { getProductsByBusiness } from "@/lib/db";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

async function toggleProductActive(formData: FormData) {
  "use server";
  const id = formData.get("productId") as string;
  const active = formData.get("active") === "true";
  if (active) {
    await setProductActive(id, true);
  } else {
    await deleteProduct(id);
  }
}

export default async function BusinessProductsPage() {
  const user = await requireBusiness();
  const products = await getProductsByBusiness(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your inventory, pricing, and availability.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={ROUTES.businessNewProduct} />}
        >
          <Plus />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Product List</CardTitle>
            <CardDescription>{products.length} products</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search products…" className="w-full pl-8 sm:w-56" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        width={40}
                        height={40}
                        className="size-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate font-medium">
                    {product.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name ?? "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        product.stock_quantity < 10
                          ? "text-amber-600"
                          : "text-foreground"
                      )}
                    >
                      {product.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        product.is_active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {product.is_active ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={
                          <Link
                            href={ROUTES.businessEditProduct(product.id)}
                          />
                        }
                        aria-label={`Edit ${product.title}`}
                      >
                        <Pencil />
                      </Button>
                      <form action={toggleProductActive}>
                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />
                        <input
                          type="hidden"
                          name="active"
                          value={String(product.is_active)}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={
                            product.is_active
                              ? `Deactivate ${product.title}`
                              : `Activate ${product.title}`
                          }
                        >
                          <Power />
                        </Button>
                      </form>
                      <DeleteProductButton
                        productId={product.id}
                        productTitle={product.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No products yet. Add your first product to start selling.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
