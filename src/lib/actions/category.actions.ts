"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const icon = (formData.get("icon") as string) || null;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description,
    icon,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/categories", "page");
  return { success: true };
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const icon = (formData.get("icon") as string) || null;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description,
      icon,
      sort_order: sortOrder,
    })
    .eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories", "page");
  return { success: true };
}

export async function toggleCategory(categoryId: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories", "page");
  return { success: true };
}
