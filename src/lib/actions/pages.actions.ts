"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Update a content page's title, subtitle, and body. Admins only — enforced
 * by RLS (public.is_admin()), matching the other admin actions.
 */
export async function updatePage(pageId: string, formData: FormData) {
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim() ?? "";
  if (!title) {
    return { error: "Title is required" };
  }

  const subtitle = (formData.get("subtitle") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() ?? "";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("pages")
    .update({
      title,
      subtitle,
      content,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    .eq("id", pageId);

  if (error) {
    return { error: error.message };
  }

  // Rebuild every route so both the public page and admin views reflect the
  // change immediately.
  revalidatePath("/", "layout");
  revalidatePath("/admin/pages", "layout");
  return { success: true };
}

/**
 * Publish or unpublish a content page. Unpublishing hides the page from the
 * public site (renders a 404). Admins only via RLS.
 */
export async function togglePagePublished(pageId: string, published: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pages")
    .update({
      is_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/pages", "layout");
  return { success: true };
}