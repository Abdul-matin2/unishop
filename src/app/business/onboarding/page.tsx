import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BusinessLogoField } from "@/components/business/BusinessLogoField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth";
import { submitBusinessOnboarding } from "@/lib/actions/business.actions";
import { getBusinessByOwner } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

export default async function BusinessOnboardingPage() {
  const user = await requireUser();

  // Already set up — send them to the dashboard.
  const existing = await getBusinessByOwner(user.id);
  if (existing) {
    redirect(ROUTES.businessDashboard);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center p-6">
      <div>
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to Home
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set up your business</CardTitle>
          <CardDescription>
            Tell students what you offer. Once submitted, our team will review
            your application before your business goes live on UniShop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={
              submitBusinessOnboarding as unknown as (
                formData: FormData
              ) => Promise<void>
            }
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                name="business_name"
                placeholder="e.g. Campus Tech Hub"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="What do you sell? Tell students what to expect…"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Student Center, Room 101"
                />
              </div>
            </div>

            <BusinessLogoField />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit">Submit for review</Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/" />}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Your business will be reviewed by our team before it goes live.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
