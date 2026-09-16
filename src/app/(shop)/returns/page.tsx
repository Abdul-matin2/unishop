import type { Metadata } from "next";
import {
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  Undo2,
  XCircle,
} from "lucide-react";

import { InfoHeader } from "@/components/pages/InfoHeader";

export const metadata: Metadata = {
  title: "Returns — UniShop",
  description:
    "UniShop return policy — return windows, condition requirements, and how to start a return with a seller.",
};

export default function ReturnsPage() {
  return (
    <>
      <InfoHeader
        icon={<Undo2 className="size-6" />}
        title="Returns &amp; Refunds"
        subtitle="We want you to love what you buy. Here is how returns work on UniShop."
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">
            Return window
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Because most UniShop sales are arranged directly between buyer and
            seller, the return window is set by the individual seller and shown
            at the time of purchase. As a general rule, sellers accept returns
            within{" "}
            <span className="font-medium text-foreground">
              7 days of delivery or pickup
            </span>{" "}
            for items that are unused and in their original condition. We
            recommend agreeing on the return terms with the seller before you
            complete any sale.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">
            Eligible for return
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {[
              {
                icon: CheckCircle2,
                title: "Item not as described",
                text: "The product differs from its listing — wrong item, colour, size, or condition.",
              },
              {
                icon: XCircle,
                title: "Damaged or defective",
                text: "The item arrives damaged or does not work as expected.",
              },
              {
                icon: PackageCheck,
                title: "Unused with original packaging",
                text: "Item is unused, unwashed, and returned with all tags and packaging.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl bg-card p-6 ring-1 ring-border"
              >
                <span
                  className={
                    item.icon === XCircle
                      ? "flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                      : "flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"
                  }
                >
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">
            How to start a return
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {[
              {
                icon: ClipboardList,
                title: "Contact the seller first",
                text: "Message, call, or WhatsApp the seller within the return window and explain the issue. Most sellers will arrange an exchange, repair, or refund directly.",
              },
              {
                icon: Undo2,
                title: "Return the item",
                text: "For local orders, return the item through the agreed method (usually in-person pickup). For shipped orders, follow the seller packaging and courier instructions.",
              },
              {
                icon: CheckCircle2,
                title: "Receive your refund",
                text: "Refunds go back the same way you paid, usually within 5–7 business days of the seller receiving the item.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-4 rounded-2xl bg-muted/50 p-6"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl bg-primary p-6 text-center">
          <p className="text-sm font-medium text-primary-foreground">
            Can not resolve a return with the seller? Contact support with your
            order details and we will step in to help.
          </p>
        </div>
      </div>
    </>
  );
}