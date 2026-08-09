import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminProducts } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductActions } from "./featured-toggle";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
        <p className="mt-1 text-muted-foreground">
          Review and moderate every product listed on UniShop.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>{products.length} products shown</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Featured</TableHead>
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
                    {product.business?.business_name ?? "Unknown Business"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name ?? "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock_quantity}
                  </TableCell>
                  <ProductActions product={product} />
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No products have been listed yet.
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
