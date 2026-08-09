"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

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
import { Separator } from "@/components/ui/separator";
import { updatePassword } from "@/lib/actions/auth.actions";
import { updateProfile } from "@/lib/actions/profile.actions";

interface ProfileFormProps {
  fullName: string;
  email: string;
  phone: string;
}

export function ProfileForm({
  fullName: initialFullName,
  email,
  phone: initialPhone,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [studentId, setStudentId] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  const [profileState, profileAction, profilePending] =
    useActionState(updateProfile, null);
  const [passwordState, passwordAction, passwordPending] =
    useActionState(updatePassword, null);

  useEffect(() => {
    if (profileState?.success) {
      toast.success("Profile updated successfully");
    } else if (profileState?.error) {
      toast.error(profileState.error);
    }
  }, [profileState]);

  useEffect(() => {
    if (passwordState?.success) {
      toast.success("Password updated successfully");
      passwordFormRef.current?.reset();
    } else if (passwordState?.error) {
      toast.error(passwordState.error);
    }
  }, [passwordState]);

  const handlePasswordSubmit = (formData: FormData) => {
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirm") as string;

    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setPasswordMismatch(false);
    passwordAction(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile details so businesses can reach you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="STU-2026-XXXX"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Use a strong password you don&apos;t use anywhere else.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={passwordFormRef}
            action={handlePasswordSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </div>

            {passwordMismatch ? (
              <p className="text-xs text-destructive">
                New passwords do not match. Please re-enter them.
              </p>
            ) : null}

            <Separator />
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Tip: use at least 8 characters with a mix of letters, numbers, and symbols.
              </p>
              <Button
                type="submit"
                variant="outline"
                disabled={passwordPending}
              >
                {passwordPending ? "Updating…" : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
