import Link from "next/link";
import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { requireBusiness } from "@/lib/auth";
import { getOrdersByBusiness, getProductsByBusiness } from "@/lib/db";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function BusinessDashboardPage() {
  const user = await requireBusiness();
  const [products, orders] = await Promise.all([
    getProductsByBusiness(user.id),
    getOrdersByBusiness(user.id),
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const lowStockProducts = products.filter(
    (product) => product.stock_quantity < 10
  );
  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      accent: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      accent: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      accent: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      accent: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          A quick overview of your store&apos;s performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconClassName={stat.accent}
          />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders placed with your business.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="text-primary"
            render={<Link href="/business/orders" />}
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    {(order.items ?? []).filter(
                      (item) => item.business_id === user.id
                    ).length}{" "}
                    item(s)
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell className="text-right">
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No orders yet. Once students place orders, they&apos;ll show
                    up here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle className="size-4" />
            </span>
            <CardTitle>Low Stock Alert</CardTitle>
          </div>
          <CardDescription>
            These products are running low and should be restocked soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name ?? "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={cn(
                        product.stock_quantity <= 5
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {product.stock_quantity} left
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Restock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {lowStockProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    All products are well stocked.
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
