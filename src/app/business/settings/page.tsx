import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireBusiness } from "@/lib/auth";
import { getBusinessByOwner } from "@/lib/db";
import { SettingsForm } from "./settings-form";

export default async function BusinessSettingsPage() {
  const user = await requireBusiness();
  const business = await getBusinessByOwner(user.id);

  if (!business) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your business profile and account preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Info</CardTitle>
          <CardDescription>
            This information is shown to students across UniShop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm business={business} />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Deactivating your account hides your products and pauses all new
            orders. This action can be reversed later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Deactivate Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
