import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LifeBuoy } from "lucide-react";

import { ManagedPage } from "@/components/pages/ManagedPage";
import { getPageBySlug } from "@/lib/db";

export const metadata: Metadata = {
  title: "Help Center — UniShop",
  description:
    "Guides for buyers and sellers on UniShop — accounts, orders, shipping, returns, and getting support.",
};

export default async function HelpCenterPage() {
  const page = await getPageBySlug("help");
  if (!page || !page.is_published) notFound();

  return <ManagedPage icon={<LifeBuoy className="size-6" />} page={page} />;
}