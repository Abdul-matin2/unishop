"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Open (or create) the buyer ↔ business thread for an order.
 * Entry point: "Message Seller" on the My Orders page.
 */
export async function openOrderThread(formData: FormData) {
  const supabase = await createClient();

  const orderId = formData.get("orderId") as string;
  const businessId = formData.get("businessId") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !orderId || !businessId) {
    redirect("/login");
  }

  // Reuse an existing thread for this order + seller.
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("business_id", businessId)
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    redirect(`/inbox/${existing.id}`);
  }

  const { data: order } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .eq("buyer_id", user.id)
    .single();

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: user.id,
      business_id: businessId,
      order_id: orderId,
      subject: order ? `Order ${order.order_number}` : "Order inquiry",
    })
    .select("id")
    .single();

  if (error || !created) {
    // Rare — don't strand the user; fall back to the order page.
    redirect(`/order/${orderId}`);
  }

  redirect(`/inbox/${created.id}`);
}

/**
 * Open (or create) a product-inquiry thread.
 * Entry point: "Ask Seller" on the product page.
 */
export async function openProductThread(formData: FormData) {
  const supabase = await createClient();

  const businessId = formData.get("businessId") as string;
  const productId = formData.get("productId") as string;
  const productSlug = (formData.get("productSlug") as string) || "";
  const subject =
    (formData.get("subject") as string) || "Product inquiry";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !businessId || !productId) {
    redirect("/login");
  }

  // Reuse an existing product-inquiry thread (order_id is null).
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("business_id", businessId)
    .eq("product_id", productId)
    .is("order_id", null)
    .maybeSingle();

  if (existing) {
    redirect(`/inbox/${existing.id}`);
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: user.id,
      business_id: businessId,
      product_id: productId,
      subject,
    })
    .select("id")
    .single();

  if (error || !created) {
    redirect(productSlug ? `/product/${productSlug}` : "/");
  }

  redirect(`/inbox/${created.id}`);
}

/**
 * Send a message in an existing conversation. RLS ensures the caller is a
 * participant.
 */
export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const trimmed = body.trim();
  if (!conversationId || !trimmed) {
    return { error: "Message cannot be empty" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in to send messages" };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: trimmed,
  });

  if (error) return { error: error.message };

  revalidatePath(`/inbox/${conversationId}`);
  revalidatePath(`/business/inbox/${conversationId}`);
  revalidatePath("/inbox");
  revalidatePath("/business/inbox");
  return { success: true };
}

/**
 * Mark the other party's messages in a conversation as read.
 */
export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  revalidatePath(`/inbox/${conversationId}`);
  revalidatePath(`/business/inbox/${conversationId}`);
  revalidatePath("/inbox");
  revalidatePath("/business/inbox");
}
