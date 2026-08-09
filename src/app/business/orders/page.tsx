import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { requireBusiness } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/actions/admin.actions";
import { getOrdersByBusiness } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/lib/types";

async function updateOrderStatusAction(formData: FormData) {
  "use server";
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;
  await updateOrderStatus(orderId, status);
}

function OrdersTable({ orders, businessId }: { orders: Order[]; businessId: string }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const items = (order.items ?? []).filter(
            (item) => item.business_id === businessId
          );
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.order_number}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  {items.map((item) => (
                    <span key={item.id} className="text-sm">
                      {item.product_title} × {item.quantity}{" "}
                      <span className="text-muted-foreground">
                        ({formatCurrency(item.subtotal)})
                      </span>
                    </span>
                  ))}
                  {items.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      —
                    </span>
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
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function BusinessOrdersPage() {
  const user = await requireBusiness();
  const businessOrders = await getOrdersByBusiness(user.id);

  const pendingOrders = businessOrders.filter((order) =>
    ["placed", "paid"].includes(order.status)
  );
  const shippedOrders = businessOrders.filter(
    (order) => order.status === "shipped"
  );
  const completedOrders = businessOrders.filter(
    (order) => order.status === "completed"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Track and manage all orders placed with your business.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            {businessOrders.length} orders in total
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <Tabs defaultValue="all">
            <TabsList variant="line">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <div className="mt-4 overflow-x-auto">
              <TabsContent value="all">
                <OrdersTable orders={businessOrders} businessId={user.id} />
              </TabsContent>
              <TabsContent value="pending">
                <OrdersTable orders={pendingOrders} businessId={user.id} />
              </TabsContent>
              <TabsContent value="shipped">
                <OrdersTable orders={shippedOrders} businessId={user.id} />
              </TabsContent>
              <TabsContent value="completed">
                <OrdersTable orders={completedOrders} businessId={user.id} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
