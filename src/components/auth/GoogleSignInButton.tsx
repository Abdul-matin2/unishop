"use client";

import { useState, type ReactNode, type SVGProps } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/actions/auth.actions";

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.94.46 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.45 1.19 14.97 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C5.22 6.87 7.87 4.75 12 4.75v.63z"
      />
    </svg>
  );
}

interface GoogleSignInButtonProps {
  children: ReactNode;
}

export function GoogleSignInButton({ children }: GoogleSignInButtonProps) {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      if (res?.url) {
        // Navigate to Google's consent screen; the return leg hits /auth/callback.
        window.location.href = res.url;
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={pending}
    >
      <GoogleIcon className="size-4 shrink-0" />
      {pending ? "Redirecting…" : children}
    </Button>
  );
}
