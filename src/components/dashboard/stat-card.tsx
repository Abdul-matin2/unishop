import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip (e.g. "bg-indigo-100 text-indigo-600") */
  iconClassName?: string;
  hint?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  hint,
}: StatCardProps) {
  return (
    <Card size="sm" className="py-4">
      <CardContent className="flex items-center gap-4">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground",
            iconClassName
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {hint ? (
            <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
