import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { ManagedPage } from "@/components/pages/ManagedPage";
import { getPageBySlug } from "@/lib/db";

export const metadata: Metadata = {
  title: "About Us — UniShop",
  description:
    "Learn about UniShop, the student marketplace connecting campus students with trusted businesses for textbooks, electronics, food, and more.",
};

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  if (!page || !page.is_published) notFound();

  return <ManagedPage icon={<ShoppingBag className="size-6" />} page={page} />;
}