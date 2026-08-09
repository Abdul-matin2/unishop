import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function StudentProfilePage() {
  const user = await requireStudent();

  const name = user.full_name?.trim() || user.email.split("@")[0] || "Student";
  const initials = getInitials(name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-base font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">Student</p>
        </div>
        <Button variant="outline" size="sm">
          <Camera />
          Change Photo
        </Button>
      </div>

      <ProfileForm
        fullName={user.full_name ?? ""}
        email={user.email}
        phone={user.phone ?? ""}
      />
    </div>
  );
}
