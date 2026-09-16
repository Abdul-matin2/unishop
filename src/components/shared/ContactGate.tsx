"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactGateProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string | undefined;
  children: React.ReactNode;
}

/**
 * Wraps a "call / WhatsApp the seller" link so guests are asked to log in or
 * sign up before contacting anyone. Signed-in users click straight through to
 * the link. The underlying <a> is kept (not <button>) so the existing button
 * styling, disabled "no number" state, and keyboard semantics are unchanged.
 */
export function ContactGate({ href, target, children, ...props }: ContactGateProps) {
  const [prompt, setPrompt] = React.useState<{ open: boolean; redirect: string }>({
    open: false,
    redirect: "",
  });

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href) return;
    // Suppress default navigation while we check the session.
    event.preventDefault();

    void (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Signed in — proceed with the original link behaviour (new tab for
        // WhatsApp, same tab for a phone call).
        if (target === "_blank") {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = href;
        }
      } else {
        // Guest — capture where we are so they return here after authing.
        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        setPrompt({ open: true, redirect });
      }
    })();
  };

  return (
    <>
      <a href={href} onClick={handleClick} target={target} {...props}>
        {children}
      </a>
      <Dialog
        open={prompt.open}
        onOpenChange={(open) => setPrompt((p) => ({ ...p, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in to contact the seller</DialogTitle>
            <DialogDescription>
              Seller contact details are only shown to signed-in students. Create
              a free account or log in to call or WhatsApp them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPrompt((p) => ({ ...p, open: false }))}
            >
              Maybe later
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`${ROUTES.login}?redirectTo=${prompt.redirect}`} />}
            >
              Log in
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`${ROUTES.signup}?redirectTo=${prompt.redirect}`} />}
            >
              Create account
              <ArrowRight data-icon="inline-end" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}