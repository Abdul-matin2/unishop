import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Get the current authenticated user's profile.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Require an authenticated user. Redirects to /login if not found.
 */
export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require a student role. Redirects if not a student.
 */
export async function requireStudent(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "student") {
    redirect("/");
  }
  return user;
}

/**
 * Require a business role. Redirects if not a business.
 */
export async function requireBusiness(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "business") {
    redirect("/");
  }
  return user;
}

/**
 * Require an admin role. Redirects if not an admin.
 */
export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}

/**
 * Check if the current user is banned.
 */
export async function isBanned(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.is_banned ?? false;
}
