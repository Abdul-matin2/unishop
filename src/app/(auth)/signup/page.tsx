"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  MailCheck,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signUp } from "@/lib/actions/auth.actions";

type Role = "student" | "business";

const ROLES: {
  value: Role;
  title: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  {
    value: "student",
    title: "I'm a Student",
    description: "Shop and save on everything you need for campus life.",
    icon: GraduationCap,
  },
  {
    value: "business",
    title: "I'm a Business Owner",
    description: "Sell to thousands of students across campus.",
    icon: Store,
  },
];

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, null);
  const [role, setRole] = useState<Role>("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleSubmit = (formData: FormData) => {
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    formAction(formData);
  };

  if (state?.success) {
    return (
      <Card className="shadow-none ring-1">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">
              {state.email ?? "your email"}
            </span>
            . Click it to finish creating your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/40 p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              The email must be verified before you can log in — this applies to
              both student and business accounts. Didn&apos;t get the link? Check
              your spam folder, then try logging in to request it again.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button nativeButton={false} render={<Link href="/login" />}>
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none ring-1">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create Your Account
        </CardTitle>
        <CardDescription>
          Join UniShop in less than a minute — it&apos;s free.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={handleSubmit} className="space-y-5">
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
            <Label>I am joining as a…</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const selected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-background hover:bg-muted/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{r.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="role" value={role} />
          </div>

          {role === "business" && (
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                name="business_name"
                placeholder="e.g. Campus Tech Hub"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="full_name"
              autoComplete="name"
              placeholder="Alex Smith"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              required
            />
            <p className="text-xs text-muted-foreground">
              Any regular or institutional email works (e.g. Gmail or a
              university address). A verification link is sent to confirm it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordMismatch(false);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordMismatch(false);
                }}
                required
              />
            </div>
          </div>

          {passwordMismatch ? (
            <p className="text-xs text-destructive">
              Passwords do not match. Please re-enter them.
            </p>
          ) : null}

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="font-normal text-muted-foreground">
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </Label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Creating account…" : "Create Account"}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton>Sign up with Google</GoogleSignInButton>
        <p className="text-center text-xs text-muted-foreground">
          Google accounts start as students — select &quot;I&apos;m a Business
          Owner&quot; and complete onboarding after logging in to sell.
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
