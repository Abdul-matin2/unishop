import type { Metadata } from "next";

import { requireStudent } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/db";
import { ConversationList } from "@/components/messaging/ConversationList";

export const metadata: Metadata = {
  title: "Inbox — UniShop",
};

export default async function InboxPage() {
  const user = await requireStudent();
  const conversations = await getConversationsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="mt-1 text-muted-foreground">
          Messages with campus sellers.
        </p>
      </div>

      <ConversationList
        conversations={conversations}
        hrefPrefix="/inbox"
        emptyTitle="No messages yet"
        emptyMessage="Ask a seller a question from any product page, or message them from one of your orders."
      />
    </div>
  );
}
