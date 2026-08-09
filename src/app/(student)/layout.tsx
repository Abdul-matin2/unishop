import { LogOut, ShieldAlert } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth.actions";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStudent();

  if (user.is_banned) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 via-white to-white px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShieldAlert className="size-6" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">
              Account Suspended
            </h1>
            <p className="text-sm text-muted-foreground">
              Your account has been suspended, so you can&apos;t access your
              account right now. If you believe this is a mistake, please
              contact support.
            </p>
            <form action={signOut} className="mt-2 w-full">
              <Button type="submit" variant="outline" className="w-full">
                <LogOut />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const name = user.full_name?.trim() || user.email.split("@")[0] || "Student";
  const initials = getInitials(name);

  return (
    <DashboardShell
      variant="student"
      user={{ name, email: user.email, initials }}
    >
      {children}
    </DashboardShell>
  );
}
