import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HelpCircle } from "lucide-react";

import { ManagedPage } from "@/components/pages/ManagedPage";
import { getPageBySlug } from "@/lib/db";

export const metadata: Metadata = {
  title: "FAQ — UniShop",
  description:
    "Answers to common questions about buying, selling, delivery, returns, and accounts on UniShop.",
};

export default async function FaqPage() {
  const page = await getPageBySlug("faq");
  if (!page || !page.is_published) notFound();

  return <ManagedPage icon={<HelpCircle className="size-6" />} page={page} />;
}