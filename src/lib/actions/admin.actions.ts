"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveBusiness(businessId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("businesses")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  // Also update the user's role to business if not already
  await supabase
    .from("profiles")
    .update({ role: "business" })
    .eq("id", businessId);

  revalidatePath("/admin/businesses", "page");
  return { success: true };
}

export async function rejectBusiness(businessId: string, reason?: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("businesses")
    .update({
      status: "rejected",
      rejection_reason: reason || null,
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  revalidatePath("/admin/businesses", "page");
  return { success: true };
}

export async function toggleFeatured(productId: string, featured: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_featured: featured })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin/products", "page");
  return { success: true };
}

export async function banUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: true })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users", "page");
  return { success: true };
}

export async function unbanUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: false })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users", "page");
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function subscribeToNewsletter(email: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { error: "You're already subscribed!" };
    }
    return { error: error.message };
  }

  return { success: true };
}
