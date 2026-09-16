import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";

import { ManagedPage } from "@/components/pages/ManagedPage";
import { getPageBySlug } from "@/lib/db";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us — UniShop",
  description:
    "Get in touch with the UniShop team — email, phone, WhatsApp, or our campus support desk.",
};

export default async function ContactPage() {
  const page = await getPageBySlug("contact");
  if (!page || !page.is_published) notFound();

  return (
    <>
      <ManagedPage icon={<Mail className="size-6" />} page={page} />

      {/* The message form is part of the site, not page content — keep it on
      the contact page even when admins edit the prose above. */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-8">
          <h2 className="text-xl font-bold tracking-tight">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in the form and we will get back to you. This opens your email
            app with the message ready to send.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}