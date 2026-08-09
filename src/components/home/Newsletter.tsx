"use client";

import { useState, type SyntheticEvent } from "react";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

import { subscribeToNewsletter } from "@/lib/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await subscribeToNewsletter(trimmed);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("You're on the list! Welcome to UniShop.");
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-12 text-center sm:px-12 md:px-16 md:py-16">
        {/* Decorative circles */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-violet-400/20 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/15 text-white">
            <Mail className="size-5" />
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Stay in the Loop
          </h2>
          <p className="mt-2 text-sm text-indigo-100 md:text-base">
            Get the latest deals and updates delivered to your inbox.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              disabled={submitting}
              className="h-11 flex-1 rounded-full border-white/20 bg-white/10 px-5 text-white placeholder:text-indigo-200 focus-visible:border-white/40 focus-visible:ring-white/30"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-full bg-white px-6 text-indigo-700 hover:bg-indigo-50"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
              <Send className="size-4" />
            </Button>
          </form>

          <p className="mt-4 text-xs text-indigo-200">
            No spam — just student deals. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
