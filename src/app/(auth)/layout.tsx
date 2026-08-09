import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-12">
      <Link href="/" className="mb-8 flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <ShoppingBag className="size-6" />
        </span>
        <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
        <span className="max-w-xs text-sm text-muted-foreground">
          {APP_DESCRIPTION}
        </span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
