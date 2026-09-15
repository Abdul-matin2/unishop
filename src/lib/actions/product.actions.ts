"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const categoryId = formData.get("category_id") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const originalPrice = formData.get("original_price")
    ? parseFloat(formData.get("original_price") as string)
    : null;
  const stockQuantity = parseInt(formData.get("stock_quantity") as string);
  const condition = (formData.get("condition") as string) || "new";

  const location = (formData.get("location") as string)?.trim() ?? "";
  if (!location) {
    return { error: "Location is required" };
  }
  const institution = (formData.get("institution") as string)?.trim() || null;
  const imageUrl = (formData.get("image_url") as string)?.trim() || null;

  // Seller contact numbers — buyers call / WhatsApp the seller directly.
  const whatsappNumber = (formData.get("whatsapp_number") as string)?.trim() ?? "";
  if (!whatsappNumber) {
    return { error: "A WhatsApp number is required so buyers can message you" };
  }
  const callNumber = (formData.get("call_number") as string)?.trim() ?? "";
  if (!callNumber) {
    return { error: "A call number is required so buyers can reach you by phone" };
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase.from("products").insert({
    business_id: user.id,
    category_id: categoryId,
    title,
    slug,
    description,
    price,
    original_price: originalPrice,
    stock_quantity: stockQuantity,
    condition,
    location,
    institution,
    whatsapp_number: whatsappNumber,
    call_number: callNumber,
    image_url: imageUrl,
    image_urls: imageUrl ? [imageUrl] : [],
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/products", "page");
  redirect("/business/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const categoryId = formData.get("category_id") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const originalPrice = formData.get("original_price")
    ? parseFloat(formData.get("original_price") as string)
    : null;
  const stockQuantity = parseInt(formData.get("stock_quantity") as string);
  const condition = (formData.get("condition") as string) || "new";

  const location = (formData.get("location") as string)?.trim() ?? "";
  if (!location) {
    return { error: "Location is required" };
  }
  const institution = (formData.get("institution") as string)?.trim() || null;
  const imageUrl = (formData.get("image_url") as string)?.trim() || null;

  // Seller contact numbers — buyers call / WhatsApp the seller directly.
  const whatsappNumber = (formData.get("whatsapp_number") as string)?.trim() ?? "";
  if (!whatsappNumber) {
    return { error: "A WhatsApp number is required so buyers can message you" };
  }
  const callNumber = (formData.get("call_number") as string)?.trim() ?? "";
  if (!callNumber) {
    return { error: "A call number is required so buyers can reach you by phone" };
  }

  const { error } = await supabase
    .from("products")
    .update({
      category_id: categoryId,
      title,
      description,
      price,
      original_price: originalPrice,
      stock_quantity: stockQuantity,
      condition,
      location,
      institution,
      whatsapp_number: whatsappNumber,
      call_number: callNumber,
      image_url: imageUrl,
      image_urls: imageUrl ? [imageUrl] : [],
    })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/products", "page");
  redirect("/business/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/products", "page");
  return { success: true };
}

/**
 * Set a product's active state (used to re-activate a deactivated product).
 */
export async function setProductActive(productId: string, active: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("products")
    .update({ is_active: active })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/business/products", "page");
  return { success: true };
}
