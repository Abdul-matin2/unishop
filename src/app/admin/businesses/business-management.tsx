"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { approveBusiness, rejectBusiness } from "@/lib/actions/admin.actions";
import { cn, formatDate } from "@/lib/utils";
import type { Business, BusinessStatus } from "@/lib/types";

export interface BusinessWithOwner extends Business {
  owner?: { id: string; email: string; full_name: string | null } | null;
}

const STATUS_STYLES: Record<BusinessStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  suspended: "border-border bg-muted text-muted-foreground",
};

type TabValue = "pending" | "approved" | "rejected" | "all";

function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  return (
    <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

function BusinessRow({ business }: { business: BusinessWithOwner }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<BusinessStatus>(business.status);

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveBusiness(business.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setStatus("approved");
        toast.success(`${business.business_name} approved`);
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectBusiness(business.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setStatus("rejected");
        toast.success(`${business.business_name} rejected`);
        router.refresh();
      }
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{business.business_name}</TableCell>
      <TableCell className="text-muted-foreground">
        {business.owner?.full_name ?? business.owner?.email ?? "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(business.created_at)}
      </TableCell>
      <TableCell>
        <BusinessStatusBadge status={status} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          {status !== "approved" && (
            <Button
              size="sm"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              disabled={isPending}
              onClick={handleApprove}
            >
              Approve
            </Button>
          )}
          {status !== "rejected" && (
            <Button
              variant="outline"
              size="sm"
              className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              disabled={isPending}
              onClick={handleReject}
            >
              Reject
            </Button>
          )}
          <Button variant="ghost" size="sm" disabled={isPending}>
            <Eye />
            View
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BusinessManagement({
  businesses,
}: {
  businesses: BusinessWithOwner[];
}) {
  const [tab, setTab] = useState<TabValue>("all");

  const counts = {
    all: businesses.length,
    pending: businesses.filter((b) => b.status === "pending").length,
    approved: businesses.filter((b) => b.status === "approved").length,
    rejected: businesses.filter((b) => b.status === "rejected").length,
  };

  const tabs: { value: TabValue; label: string }[] = [
    { value: "pending", label: `Pending (${counts.pending})` },
    { value: "approved", label: `Approved (${counts.approved})` },
    { value: "rejected", label: `Rejected (${counts.rejected})` },
    { value: "all", label: `All (${counts.all})` },
  ];

  const visible =
    tab === "all"
      ? businesses
      : businesses.filter((business) => business.status === tab);

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
      <TabsList variant="line">
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((business) => (
              <BusinessRow key={business.id} business={business} />
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  No businesses in this view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Tabs>
  );
}
