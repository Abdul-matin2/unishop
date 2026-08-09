"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Building2, Clock, XCircle } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type BusinessGateState =
  | { kind: "approved" }
  | { kind: "none" }
  | { kind: "pending" }
  | { kind: "rejected"; reason: string | null };

interface BusinessGateProps {
  state: BusinessGateState;
  businessName?: string;
  user: { name: string; email?: string; initials: string };
  children: React.ReactNode;
}

/**
 * Renders the business dashboard shell when the business is approved, a clear
 * notice otherwise, and lets the onboarding route render standalone so a
 * business owner can create their profile before it has been approved.
 */
export function BusinessGate({
  state,
  businessName,
  user,
  children,
}: BusinessGateProps) {
  const pathname = usePathname();

  if (pathname === ROUTES.businessOnboarding) {
    return <>{children}</>;
  }

  if (state.kind === "approved") {
    return (
      <DashboardShell variant="business" businessName={businessName} user={user}>
        {children}
      </DashboardShell>
    );
  }

  if (state.kind === "none") {
    return (
      <GateNotice
        icon={Building2}
        iconClassName="bg-primary/10 text-primary"
        title="You haven't set up your business yet"
        message="Create a business profile to start selling on UniShop. Once you submit, our team will review your application."
      >
        <Button
          nativeButton={false}
          render={<Link href={ROUTES.businessOnboarding} />}
        >
          Set up your business
        </Button>
      </GateNotice>
    );
  }

  if (state.kind === "pending") {
    return (
      <GateNotice
        icon={Clock}
        iconClassName="bg-amber-100 text-amber-600"
        title="Your business is pending approval"
        message="We're reviewing your business profile. You'll be able to use the dashboard once it's approved."
      />
    );
  }

  return (
    <GateNotice
      icon={XCircle}
      iconClassName="bg-rose-100 text-rose-600"
      title="Your business was rejected"
      message={
        state.reason ||
        "Your business application was not approved. You can update your details and reapply."
      }
    >
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={ROUTES.businessOnboarding} />}
      >
        Update &amp; Reapply
      </Button>
    </GateNotice>
  );
}

function GateNotice({
  icon: Icon,
  iconClassName,
  title,
  message,
  children,
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-xl",
              iconClassName
            )}
          >
            <Icon className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
