"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Submit a review for a product. Requires an authenticated user.
 * On success the product page is revalidated so the new review appears.
 */
export async function submitReview(input: {
  productId: string;
  productSlug: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to review" };
  }

  if (input.rating < 1 || input.rating > 5) {
    return { error: "Please select a rating between 1 and 5" };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: input.productId,
    user_id: user.id,
    rating: input.rating,
    comment: input.comment?.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/product/${input.productSlug}`, "page");
  return { success: true };
}
