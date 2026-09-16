import type { Metadata } from "next";
import {
  Building2,
  Clock,
  MapPin,
  Package,
  Truck,
  Wallet,
} from "lucide-react";

import { InfoHeader } from "@/components/pages/InfoHeader";

export const metadata: Metadata = {
  title: "Shipping & Delivery — UniShop",
  description:
    "How shipping and delivery work on UniShop — pickup options, local delivery, timelines, and costs.",
};

const methods = [
  {
    icon: MapPin,
    title: "Campus pickup",
    text: "The most common option. Arrange a time and location with the seller on campus — free, same-day, and you can inspect the item before paying.",
  },
  {
    icon: Truck,
    title: "Local delivery",
    text: "Many sellers offer short-distance delivery around their campus. Delivery fees and timing are agreed directly with the seller.",
  },
  {
    icon: Package,
    title: "Nationwide shipping",
    text: "Some sellers ship within Ghana via courier. Fees and estimated time of arrival are set per product by the seller.",
  },
];

const deliveryTimes = [
  { method: "Campus pickup", timeline: "Same day", cost: "Free" },
  { method: "Local delivery", timeline: "1 – 2 days", cost: "Agreed with seller" },
  { method: "Nationwide shipping", timeline: "2 – 5 days", cost: "Set by seller" },
];

export default function ShippingPage() {
  return (
    <>
      <InfoHeader
        icon={<Truck className="size-6" />}
        title="Shipping & Delivery"
        subtitle="UniShop is built for campus life — most orders are picked up locally or delivered nearby. Here is how delivery works."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Methods */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight">
            Delivery options
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {methods.map((method) => (
              <div
                key={method.title}
                className="rounded-2xl bg-card p-6 ring-1 ring-border"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <method.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{method.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {method.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery table */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Timelines &amp; costs
          </h2>
          <div className="mt-6 overflow-hidden rounded-2xl bg-card ring-1 ring-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Method</th>
                    <th className="px-6 py-4 font-medium">Timeline</th>
                    <th className="px-6 py-4 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deliveryTimes.map((row) => (
                    <tr key={row.method}>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {row.method}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {row.timeline}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Things to know
          </h2>
          <div className="mt-6 flex flex-col gap-5">
            {[
              {
                icon: Clock,
                title: "Timing is agreed with the seller",
                text: "Because most sales are arranged directly, pickup and delivery times are agreed in your chat with the seller. Confirm the time, location, and any fee before completing the sale.",
              },
              {
                icon: Wallet,
                title: "Payment happens at delivery",
                text: "For local orders you usually pay when you receive the item. For nationwide shipping, the seller will let you know the agreed payment process before dispatch.",
              },
              {
                icon: Building2,
                title: "For sellers — set clear expectations",
                text: "When listing a product, state whether you offer pickup or delivery and your usual timeline. Clear communication leads to happier buyers and better reviews.",
              },
            ].map((note) => (
              <div
                key={note.title}
                className="flex items-start gap-4 rounded-2xl bg-muted/50 p-6"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <note.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {note.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}