import type { Metadata } from "next";

import { requireBusiness } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/db";
import { ConversationList } from "@/components/messaging/ConversationList";

export const metadata: Metadata = {
  title: "Inbox — UniShop",
};

export default async function BusinessInboxPage() {
  const user = await requireBusiness();
  const all = await getConversationsForUser(user.id);
  const conversations = all.filter((c) => c.business_id === user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="mt-1 text-muted-foreground">
          Messages from your customers.
        </p>
      </div>

      <ConversationList
        conversations={conversations}
        hrefPrefix="/business/inbox"
        emptyTitle="No customer messages yet"
        emptyMessage="When a buyer messages you about a product or order, it will show up here."
      />
    </div>
  );
}
