"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, null);

  if (state?.success) {
    return (
      <Card className="shadow-none ring-1">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription>
            We&apos;ve sent you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            If an account exists for your email, you&apos;ll receive a reset
            link shortly. Follow the link to choose a new password.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            className="w-full"
            size="lg"
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none ring-1">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Forgot Password?
        </CardTitle>
        <CardDescription>
          No worries — enter your email and we&apos;ll send you a link to reset
          your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={formAction} className="space-y-5">
          {state?.error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@university.edu"
                required
                className="pl-8"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Sending…" : "Send Reset Link"}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
