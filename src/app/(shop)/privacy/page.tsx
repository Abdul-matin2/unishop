import type { Metadata } from "next";
import {
  Cookie,
  Database,
  EyeOff,
  Lock,
  Mail,
  Share2,
  ShieldCheck,
} from "lucide-react";

import { InfoHeader } from "@/components/pages/InfoHeader";

export const metadata: Metadata = {
  title: "Privacy Policy — UniShop",
  description:
    "How UniShop collects, uses, and protects your personal data as a student marketplace.",
};

const sections = [
  {
    icon: Database,
    title: "1. Information we collect",
    body: "We collect the information you provide when you create an account — your name, email address, phone number, role (student or business), and institution. When you list a product or contact a seller, we store those details to keep the marketplace running. Payment information is handled by the payment providers and is not stored on our servers.",
  },
  {
    icon: EyeOff,
    title: "2. How we use your information",
    body: "We use your information to create and manage your account, process product listings and orders, let buyers and sellers contact each other, improve our services, and send important account notifications. We never sell your personal data to third parties.",
  },
  {
    icon: Share2,
    title: "3. Sharing your information",
    body: "Your contact details are only shared in specific, necessary ways: with the seller or buyer you are transacting with so you can arrange delivery, and with service providers who help us operate the platform under strict confidentiality agreements.",
  },
  {
    icon: Cookie,
    title: "4. Cookies & local storage",
    body: "We use cookies and local storage to keep you signed in, remember your preferences, and understand how the marketplace is used so we can improve it. You can disable cookies in your browser, though some features may not work as smoothly.",
  },
  {
    icon: Lock,
    title: "5. Data security",
    body: "We protect your data with industry-standard safeguards, including encrypted connections and access controls. Only people who need it to run the platform can see your information, and only for the tasks they perform.",
  },
  {
    icon: ShieldCheck,
    title: "6. Your rights",
    body: "You can review, update, or delete your account information at any time from your profile page. You may also ask us to close your account permanently or request a copy of the data we hold — send the request to support and we will act within 30 days.",
  },
  {
    icon: Mail,
    title: "7. Contact us",
    body: "Questions about this policy or your data? Email support@unishop.app. We will respond within 24 hours on weekdays and are happy to explain anything you do not understand.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <InfoHeader
        icon={<Lock className="size-6" />}
        title="Privacy Policy"
        subtitle="Last updated: 10 September 2026. Your privacy matters — here is exactly how we handle your data."
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl bg-card p-6 ring-1 ring-border"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <section.icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}