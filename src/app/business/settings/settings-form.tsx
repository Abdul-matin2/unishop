"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BusinessLogoField } from "@/components/business/BusinessLogoField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBusiness } from "@/lib/actions/business.actions";
import type { Business } from "@/lib/types";

type SettingsState = { success?: boolean; error?: string } | null;

export function SettingsForm({ business }: { business: Business }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: SettingsState, formData: FormData) => updateBusiness(formData),
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Business settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="business_name">Business Name</Label>
        <Input
          id="business_name"
          name="business_name"
          defaultValue={business.business_name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Tell students what your business offers…"
          defaultValue={business.description ?? ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={business.contact_email ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={business.phone ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={business.address ?? ""}
        />
      </div>

      <BusinessLogoField initialUrl={business.logo_url} />

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
