"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Add the product to the wishlist if it isn't there, or remove it if it is.
 * Returns the new state so the caller can update the heart without a reload.
 */
export async function toggleWishlist(
  productId: string
): Promise<{ success?: boolean; inWishlist?: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to save items to your wishlist" };
  }

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("wishlist_items").insert({
      user_id: user.id,
      product_id: productId,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, inWishlist: !existing };
}
