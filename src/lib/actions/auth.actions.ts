"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

/**
 * Shared shape for auth / profile action results. When used with
 * `useActionState`, the action receives the previous state as its first
 * argument, so every action below is written as `(prevState, formData)`.
 */
export type AuthActionState = {
  error?: string;
  success?: boolean;
  /** Email used when requesting verification, shown on the success screen. */
  email?: string;
} | null;

export async function signIn(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Friendlier hint when the account exists but the email isn't verified yet.
    if (/email not confirmed|email not verified/i.test(error.message)) {
      return {
        error:
          "Please verify your email before logging in. Check your inbox for a confirmation link.",
      };
    }
    return { error: error.message };
  }

  // Redirect based on the user's role.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      revalidatePath("/", "layout");
      redirect(ROUTES.adminDashboard);
    }
    if (profile?.role === "business") {
      revalidatePath("/", "layout");
      redirect(ROUTES.businessDashboard);
    }
    if (profile?.role === "student") {
      revalidatePath("/", "layout");
      redirect(ROUTES.home);
    }
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.home);
}

export async function signUp(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = (formData.get("role") as string) || "student";
  const businessName = formData.get("business_name") as string;

  const metadata: Record<string, string> = {
    full_name: fullName,
    role,
  };

  if (role === "business" && businessName) {
    metadata.business_name = businessName;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      // Where the confirmation link returns after the email is verified.
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // When "Confirm email" is enabled, no session is issued until the link is
  // clicked — show a "check your email" screen instead of redirecting.
  if (!data.session) {
    return { success: true, email };
  }

  // Confirmation disabled — the account is already active; send to login.
  revalidatePath("/", "layout");
  redirect(ROUTES.login);
}

/**
 * Begin Google OAuth sign-in. Returns the Google authorization URL for the
 * client to navigate to. The PKCE code-verifier is stored in a cookie (server
 * client) so `/auth/callback` can exchange the code on the return leg.
 * `role` (from the signup role picker) is stored as user_metadata for NEW
 * users so the `on_auth_user_created` trigger creates the right role.
 */
export async function signInWithGoogle(
  role?: "student" | "business"
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();

  const appUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      data: role ? { role } : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.home);
}

export async function resetPassword(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?redirect_to=${process.env.NEXT_PUBLIC_SUPABASE_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
