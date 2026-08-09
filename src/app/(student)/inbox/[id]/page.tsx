import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { requireStudent } from "@/lib/auth";
import { getConversationById } from "@/lib/db";
import { ConversationThread } from "@/components/messaging/ConversationThread";

export const metadata: Metadata = {
  title: "Conversation — UniShop",
};

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const user = await requireStudent();

  const conversation = await getConversationById(id);
  if (!conversation) notFound();

  const otherName = conversation.business?.business_name ?? "Seller";

  return (
    <div className="space-y-4">
      <Link
        href="/inbox"
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
