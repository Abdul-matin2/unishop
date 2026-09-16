import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";

import { ManagedPage } from "@/components/pages/ManagedPage";
import { getPageBySlug } from "@/lib/db";

export const metadata: Metadata = {
  title: "Shipping & Delivery — UniShop",
  description:
    "How shipping and delivery work on UniShop — pickup options, local delivery, timelines, and costs.",
};

export default async function ShippingPage() {
  const page = await getPageBySlug("shipping");
  if (!page || !page.is_published) notFound();

  return <ManagedPage icon={<Truck className="size-6" />} page={page} />;
}