import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";

import { ManagedPage } from "@/components/pages/ManagedPage";
import { getPageBySlug } from "@/lib/db";

export const metadata: Metadata = {
  title: "Privacy Policy — UniShop",
  description:
    "How UniShop collects, uses, and protects your personal data as a student marketplace.",
};

export default async function PrivacyPage() {
  const page = await getPageBySlug("privacy");
  if (!page || !page.is_published) notFound();

  return <ManagedPage icon={<Lock className="size-6" />} page={page} />;
}