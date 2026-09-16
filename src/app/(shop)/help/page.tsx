import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  LifeBuoy,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Truck,
  Undo2,
  User,
} from "lucide-react";

import { InfoHeader } from "@/components/pages/InfoHeader";

export const metadata: Metadata = {
  title: "Help Center — UniShop",
  description:
    "Guides for buyers and sellers on UniShop — accounts, orders, shipping, returns, and getting support.",
};

const guides = [
  {
    icon: User,
    title: "Accounts & login",
    text: "Create an account, reset your password, and manage your profile and institution.",
  },
  {
    icon: MapPin,
    title: "Pickup & delivery",
    text: "How pickup and local delivery work, and how to arrange them with a seller.",
  },
  {
    icon: MessageSquare,
    title: "Messaging sellers",
    text: "Use in-app chat, calls, and WhatsApp to ask questions and negotiate prices.",
  },
  {
    icon: ShieldCheck,
    title: "Staying safe",
    text: "Verified businesses, buyer reviews, and tips for inspecting items at pickup.",
  },
  {
    icon: BookOpen,
    title: "Selling guides",
    text: "List products, add contact numbers, manage stock, and track your seller dashboard.",
  },
  {
    icon: Undo2,
    title: "Returns & refunds",
    text: "Return windows, condition checks, and how to raise an issue with a seller.",
  },
];

export default function HelpCenterPage() {
  return (
    <>
      <InfoHeader
        icon={<LifeBuoy className="size-6" />}
        title="Help Center"
        subtitle="Everything you need to get the most out of UniShop — whether you are buying or selling."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Guides */}
        <section>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <div
                key={guide.title}
                className="rounded-2xl bg-card p-6 ring-1 ring-border"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <guide.icon className="size-5" />
                </span>
                <h2 className="mt-4 font-semibold">{guide.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {guide.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular help pages */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Popular help topics
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { href: "/faq", icon: BookOpen, title: "FAQ", text: "Quick answers to the most common questions." },
              { href: "/shipping", icon: Truck, title: "Shipping & Delivery", text: "Options, timelines, and how pickup works." },
              { href: "/returns", icon: Undo2, title: "Returns", text: "The return window and how to return an item." },
            ].map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="group rounded-2xl bg-card p-6 ring-1 ring-border transition-colors hover:bg-muted/50"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <topic.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold group-hover:text-primary">
                  {topic.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {topic.text}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Still stuck */}
        <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl bg-muted/50 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Mail className="size-5 text-primary" />
              Still need help?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact our support team and we will reply within 24 hours on
              weekdays.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Mail className="size-4" />
            Contact Us
          </Link>
        </section>
      </div>
    </>
  );
}