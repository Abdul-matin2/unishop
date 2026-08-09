import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { updateOrderStatus } from "@/lib/actions/admin.actions";
import { getAllOrders } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label })),
];

async function updateOrderStatusAction(formData: FormData) {
  "use server";
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;
  await updateOrderStatus(orderId, status);
}

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Buyer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>
              {order.buyer?.full_name ?? order.buyer?.email ?? "—"}
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-0.5">
                {(order.items ?? []).map((item) => (
                  <span key={item.id} className="text-sm">
                    {item.product_title} × {item.quantity}{" "}
                    <span className="text-muted-foreground">
                      ({formatCurrency(item.subtotal)})
                    </span>
                  </span>
                ))}
                {(order.items?.length ?? 0) === 0 && (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(order.total)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(order.created_at)}
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-right">
              <form
                action={updateOrderStatusAction}
                className="flex items-center justify-end gap-1.5"
              >
                <input type="hidden" name="orderId" value={order.id} />
                <Select name="status" defaultValue={order.status}>
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" variant="outline">
                  Update
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor every order placed across the marketplace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>{orders.length} orders in total</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <Tabs defaultValue="all">
            <TabsList variant="line">
              {STATUS_FILTERS.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-4 overflow-x-auto">
              {STATUS_FILTERS.map((filter) => {
                const filteredOrders =
                  filter.value === "all"
                    ? orders
                    : orders.filter(
                        (order) =>
                          order.status === (filter.value as OrderStatus)
                      );
                return (
                  <TabsContent key={filter.value} value={filter.value}>
                    <OrdersTable orders={filteredOrders} />
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
