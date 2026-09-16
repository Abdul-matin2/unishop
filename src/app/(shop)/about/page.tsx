import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Handshake,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";

import { InfoHeader } from "@/components/pages/InfoHeader";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us — UniShop",
  description:
    "Learn about UniShop, the student marketplace connecting campus students with trusted businesses for textbooks, electronics, food, and more.",
};

const values = [
  {
    icon: GraduationCap,
    title: "Made for students",
    text: "Affordable prices, campus-friendly pickup, and negotiated deals that fit a student budget.",
  },
  {
    icon: Store,
    title: "Trusted businesses",
    text: "Every business is vetted and reviewed, so you know exactly who you are buying from.",
  },
  {
    icon: Handshake,
    title: "Direct contact",
    text: "Message, call, or WhatsApp the seller directly — no middlemen, no hidden fees.",
  },
  {
    icon: MapPin,
    title: "Campus local",
    text: "Find sellers near your institution and pick up in person without waiting on shipping.",
  },
];

const steps = [
  {
    icon: Search,
    title: "Browse",
    text: "Search products by category or institution and compare prices between businesses.",
  },
  {
    icon: MessageCircle,
    title: "Contact the seller",
    text: "Chat in-app, or call and WhatsApp the seller directly to ask questions and negotiate.",
  },
  {
    icon: MapPin,
    title: "Meet & pay",
    text: "Arrange pickup or local delivery with the seller and pay on the spot. No checkout needed.",
  },
];

export default function AboutPage() {
  return (
    <>
      <InfoHeader
        icon={<ShoppingBag className="size-6" />}
        title="About UniShop"
        subtitle="A student marketplace built to make campus commerce simple, safe, and affordable."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Mission */}
        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">
              Our mission
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Connecting campus life with trusted local sellers
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              UniShop was started to give students a single place to find
              textbooks, electronics, fashion, food, and services from
              businesses already around their campus. Instead of long
              delivery waits and impersonal online marketplaces, UniShop puts
              buyers in direct contact with sellers — whether that is a quick
              in-app chat, a call, or a WhatsApp message.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              For sellers, UniShop makes it simple to list products, manage
              stock, and reach thousands of students without paying high
              commissions. For buyers, it means student-friendly prices,
              local pickup, and the confidence of dealing with reviewed
              businesses.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Products listed" },
              { value: "50+", label: "Campus businesses" },
              { value: "10,000+", label: "Student buyers" },
              { value: "100%", label: "Local, direct contact" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-card p-6 text-center ring-1 ring-border"
              >
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            What we stand for
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl bg-card p-6 ring-1 ring-border"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <value.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How UniShop works
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl bg-card p-6 ring-1 ring-border"
              >
                <span className="absolute top-5 right-5 text-4xl font-extrabold text-muted-foreground/10">
                  {index + 1}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 rounded-2xl bg-primary p-8 text-center sm:p-12">
          <h2 className="text-xl font-bold tracking-tight text-primary-foreground sm:text-2xl">
            Ready to start shopping on campus?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Browse thousands of products from trusted campus businesses, or
            become a seller and reach students today.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ROUTES.shop}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-full px-8 sm:w-auto"
              )}
            >
              Start Shopping
            </Link>
            <Link
              href={ROUTES.signup}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                }),
                "w-full border-primary-foreground/40 px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
              )}
            >
              <Store className="size-4" />
              Sell on UniShop
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}