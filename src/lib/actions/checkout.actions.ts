"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function placeOrder(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notes = formData.get("notes") as string | null;
  const shippingAddress = formData.get("shipping_address") as string | null;
  const contactPhone = formData.get("contact_phone") as string | null;

  const { data, error } = await supabase.rpc("create_order", {
    p_notes: notes,
    p_payment_method: "cash_on_pickup",
    p_shipping_address: shippingAddress,
    p_contact_phone: contactPhone,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(`/order/${data.order_id}`);
}
