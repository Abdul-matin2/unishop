"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

/**
 * Resolve the app's public origin from the current request. Server actions
 * run in response to a request, so the Host header reflects the domain the
 * user is actually on — localhost in dev, the deployed domain in production.
 * This avoids baking a hardcoded NEXT_PUBLIC_SITE_URL into the build (which
 * pointed every redirect/verification link at http://localhost:3000 after
 * deployment).
 */
async function getAppUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  if (host) {
    const proto = headersList.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

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

  // Where the user was heading when we asked them to log in (the product page,
  // e.g. /product/some-slug). Only allow internal paths to avoid open redirects.
  const redirectTo = formData.get("redirectTo") as string;
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : null;

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
      redirect(safeRedirect || ROUTES.home);
    }
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect || ROUTES.home);
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

  // Preserve the page the user came from (set by ContactGate) so they end up
  // back there after confirming and logging in. Internal paths only.
  const redirectTo = formData.get("redirectTo") as string;
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : null;

  const metadata: Record<string, string> = {
    full_name: fullName,
    role,
  };

  if (role === "business" && businessName) {
    metadata.business_name = businessName;
  }

  const appUrl = await getAppUrl();

  // If the user came from a product page, keep that target in the email link
  // so /auth/callback can send them back after they confirm.
  const next = safeRedirect
    ? `?next=${encodeURIComponent(safeRedirect)}`
    : "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      // Where the confirmation link returns after the email is verified.
      emailRedirectTo: `${appUrl}/auth/callback${next}`,
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

  // Confirmation disabled — the account is already active; send to login,
// keeping the caller's redirect target if one was provided.
  revalidatePath("/", "layout");
  redirect(
    safeRedirect ? `${ROUTES.login}?redirectTo=${encodeURIComponent(safeRedirect)}` : ROUTES.login
  );
}

/**
 * Begin Google OAuth sign-in. Returns the Google authorization URL for the
 * client to navigate to. The PKCE code-verifier is stored in a cookie (server
 * client) so `/auth/callback` can exchange the code on the return leg.
 *
 * Google users are created with the default "student" role by the
 * `on_auth_user_created` trigger. If the user wants to sell, they can
 * complete `/business/onboarding` to upgrade to a business account.
 */
export async function signInWithGoogle(redirectTo?: string): Promise<{
  error?: string;
  url?: string;
}> {
  const supabase = await createClient();

  const appUrl = await getAppUrl();

  // Carry the caller's target (e.g. a product page) through the OAuth round
  // trip; /auth/callback picks it up from `next`. Internal paths only.
  const next =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? `&next=${encodeURIComponent(redirectTo)}`
      : "";

  const callbackUrl = next ? `${appUrl}/auth/callback?${next}` : `${appUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
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

  // Send the user back to our app (not the Supabase domain) after recovery.
  const appUrl = await getAppUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback`,
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
