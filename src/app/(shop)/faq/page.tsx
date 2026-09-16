import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, HelpCircle, LifeBuoy } from "lucide-react";

import { InfoHeader } from "@/components/pages/InfoHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ — UniShop",
  description:
    "Answers to common questions about buying, selling, delivery, returns, and accounts on UniShop.",
};

const faqSections = [
  {
    heading: "Buying on UniShop",
    questions: [
      {
        q: "How do I contact a seller?",
        a: "Open a product and choose Call or WhatsApp to reach the seller directly, or use the in-app message button to ask a question. Sellers list a WhatsApp number and a call number on every product.",
      },
      {
        q: "Can I negotiate the price?",
        a: "Yes. Most sellers are open to offers. Send them a message, call, or WhatsApp chat and agree on a price before arranging pickup.",
      },
      {
        q: "How do I pay?",
        a: "UniShop is primarily a direct marketplace. You agree on a price with the seller and pay on pickup or delivery, usually by mobile money or cash. Some sellers may accept a personal arrangement via the app chat.",
      },
      {
        q: "Is buying on UniShop safe?",
        a: "Businesses are vetted, and you can read verified buyer reviews on each product page. Always contact the seller, inspect items at pickup, and pay only when you are satisfied.",
      },
    ],
  },
  {
    heading: "Selling on UniShop",
    questions: [
      {
        q: "How do I become a seller?",
        a: "Create an account, choose the business role during signup, complete the brief onboarding, and you can list your first product immediately.",
      },
      {
        q: "How much does it cost to sell?",
        a: "Listing your products on UniShop is free. There are no upfront fees or monthly charges for students selling on campus.",
      },
      {
        q: "How do I add WhatsApp and call numbers to my products?",
        a: "When creating or editing a product, fill in the Seller Contact section. Buyers see your listed numbers on the product page for quick calls and WhatsApp chats.",
      },
      {
        q: "Can I manage or delete a product?",
        a: "Yes. Open your seller dashboard, go to My Products, and use the edit, activate, or delete controls for each listing.",
      },
    ],
  },
  {
    heading: "Orders, shipping & returns",
    questions: [
      {
        q: "Do you deliver, or do I pick up?",
        a: "Most campus businesses offer pickup or short-distance local delivery. Delivery options and timing are arranged directly with the seller. See the Shipping page for details.",
      },
      {
        q: "Can I return a product?",
        a: "Yes, within the window agreed with the seller (see the Returns page). Inspect items at pickup so you can raise any issue immediately.",
      },
      {
        q: "What if the item is not what I expected?",
        a: "Contact the seller right away through chat, call, or WhatsApp. If you cannot agree, reach our support team with your order details and we will help.",
      },
    ],
  },
  {
    heading: "Accounts & troubleshooting",
    questions: [
      {
        q: "I cannot sign in. What should I do?",
        a: "Double-check your email and password, then try resetting your password from the login page. If it still fails, contact support with your account email.",
      },
      {
        q: "How do I update my profile or institution?",
        a: "Open your profile page from the account menu and edit your details. Updating your institution helps sellers tailor pickup options to you.",
      },
      {
        q: "How is my data protected?",
        a: "We only collect what is needed to run the marketplace and never sell your data. See the Privacy Policy for the full details.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <InfoHeader
        icon={<HelpCircle className="size-6" />}
        title="Frequently Asked Questions"
        subtitle="Quick answers to the most common questions. Can not find yours? Contact support."
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10">
          {faqSections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold tracking-tight">
                {section.heading}
              </h2>
              <div className="mt-5 flex flex-col gap-3">
                {section.questions.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl bg-card p-5 ring-1 ring-border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-primary p-8 text-center">
          <p className="flex items-center justify-center gap-2 font-semibold text-primary-foreground">
            <LifeBuoy className="size-5" />
            Still have questions?
          </p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Our support team is ready to help.
          </p>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mt-4"
            )}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </>
  );
}