import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { requireBusiness } from "@/lib/auth";
import { getConversationById } from "@/lib/db";
import { ConversationThread } from "@/components/messaging/ConversationThread";

export const metadata: Metadata = {
  title: "Conversation — UniShop",
};

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function BusinessThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const user = await requireBusiness();

  const conversation = await getConversationById(id);
  if (!conversation || conversation.business_id !== user.id) notFound();

  const otherName = conversation.buyer?.full_name ?? "Buyer";

  return (
    <div className="space-y-4">
      <Link
        href="/business/inbox"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to inbox
      </Link>

      <ConversationThread
        conversationId={conversation.id}
        userId={user.id}
        otherName={otherName}
        subject={conversation.subject}
        initialMessages={conversation.messages ?? []}
      />
    </div>
  );
}
