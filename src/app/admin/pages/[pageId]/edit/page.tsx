import { notFound } from "next/navigation";

import { getPageById } from "@/lib/db";
import { PageForm } from "./page-form";

interface EditPageProps {
  params: Promise<{ pageId: string }>;
}

export default async function EditPagePage({ params }: EditPageProps) {
  const { pageId } = await params;
  const page = await getPageById(pageId);
  if (!page) notFound();

  return <PageForm page={page} />;
}