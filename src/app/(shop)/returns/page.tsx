import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Undo2 } from "lucide-react";

import { ManagedPage } from "@/components/pages/ManagedPage";
import { getPageBySlug } from "@/lib/db";

export const metadata: Metadata = {
  title: "Returns — UniShop",
  description:
    "UniShop return policy — return windows, condition requirements, and how to start a return with a seller.",
};

export default async function ReturnsPage() {
  const page = await getPageBySlug("returns");
  if (!page || !page.is_published) notFound();

  return <ManagedPage icon={<Undo2 className="size-6" />} page={page} />;
}