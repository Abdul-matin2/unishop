"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Update the current user's business profile (businesses.id = auth user id).
 */
export async function updateBusiness(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const businessName = formData.get("business_name") as string;
  const description = formData.get("description") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const contactEmail = formData.get("contact_email") as string;
  const logoUrl = (formData.get("logo_url") as string)?.trim() || null;

  const { error } = await supabase
    .from("businesses")
    .update({
      business_name: businessName,
      description,
      phone,
      address,
      contact_email: contactEmail,
      logo_url: logoUrl,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/settings", "page");
  return { success: true };
}

/**
 * Create a business profile from the onboarding form. businesses.id = the
 * owner's auth user id (1:1). If the user already has a business, redirect.
 */
export async function submitBusinessOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Already onboarded — go to the dashboard.
  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    redirect("/business/dashboard");
  }

  const businessName = (formData.get("business_name") as string) || "";
  const description = formData.get("description") as string | null;
  const phone = formData.get("phone") as string | null;
  const address = formData.get("address") as string | null;
  const logoUrl = (formData.get("logo_url") as string)?.trim() || null;

  const baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  const slug = `${baseSlug || "business"}-${suffix}`;

  const { error } = await supabase.from("businesses").insert({
    id: user.id,
    business_name: businessName,
    slug,
    description,
    phone,
    address,
    logo_url: logoUrl,
    contact_email: user.email,
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/dashboard", "layout");
  redirect("/business/dashboard");
}
