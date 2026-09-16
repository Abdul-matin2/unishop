import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

/**
 * Handles the redirect after an email link (signup confirmation, etc.).
 * Supabase's PKCE flow sends `?code=...`, which we exchange for a session.
 * Falls back to the implicit-flow `access_token` params for legacy links.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  // Where to send the user after a successful exchange. Only ever allow the
  // same origin — the bare `startsWith("/")` check lets the `/\evil.com`
  // trick slip through `new URL(..., base)` as an external redirect.
  const parsedNext = new URL(searchParams.get("next") ?? ROUTES.home, request.url);
  const next =
    parsedNext.origin === new URL(request.url).origin
      ? parsedNext.pathname + parsedNext.search
      : ROUTES.home;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Land on the right dashboard for the role, like signIn does.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role === "business") {
          return NextResponse.redirect(
            new URL(ROUTES.businessDashboard, request.url)
          );
        }
        if (profile?.role === "admin") {
          return NextResponse.redirect(
            new URL(ROUTES.adminDashboard, request.url)
          );
        }
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Legacy implicit-flow links carry the tokens directly in the URL.
  const accessToken = searchParams.get("access_token");
  if (accessToken) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: searchParams.get("refresh_token") ?? "",
    });
    if (!error && data.user) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Code invalid/expired — send them to log in normally.
  return NextResponse.redirect(new URL(ROUTES.login, request.url));
}
