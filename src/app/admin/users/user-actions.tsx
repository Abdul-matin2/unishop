"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { banUser, unbanUser } from "@/lib/actions/admin.actions";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function UserRow({ user }: { user: Profile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [banned, setBanned] = useState(user.is_banned);

  const handleToggleBan = () => {
    startTransition(async () => {
      const result = banned ? await unbanUser(user.id) : await banUser(user.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setBanned((value) => !value);
        toast.success(banned ? "User unbanned" : "User banned");
        router.refresh();
      }
    });
  };

  return (
    <>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            banned
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          )}
        >
          {banned ? "Banned" : "Active"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant={banned ? "outline" : "destructive"}
          className={cn(
            banned &&
              "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          )}
          disabled={isPending}
          onClick={handleToggleBan}
        >
          {banned ? "Unban" : "Ban"}
        </Button>
      </TableCell>
    </>
  );
}
