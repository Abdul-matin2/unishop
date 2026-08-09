import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireAdmin } from "@/lib/auth";

function getInitials(name: string | null) {
  return (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <DashboardShell
      variant="admin"
      user={{
        name: user.full_name ?? user.email,
        email: user.email,
        initials: getInitials(user.full_name),
      }}
    >
      {children}
    </DashboardShell>
  );
}
