import Link from "next/link";
import { MessageSquare } from "lucide-react";

import type { Conversation } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationListProps {
  conversations: Conversation[];
  /** Base path for threads, e.g. "/inbox" or "/business/inbox". */
  hrefPrefix: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ConversationList({
  conversations,
  hrefPrefix,
  emptyTitle = "No messages yet",
  emptyMessage = "When a buyer messages you (or you message a seller), it will show up here.",
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="size-6 text-muted-foreground" />
        </div>
        <p className="font-medium">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-border">
      {conversations.map((conversation) => {
        const name = conversation.business?.business_name ?? "Business";
        const preview =
          conversation.last_message?.body ??
          conversation.subject ??
          "No messages yet";
        const unread = (conversation.unread_count ?? 0) > 0;
        const logoUrl = conversation.business?.logo_url;

        return (
          <Link
            key={conversation.id}
            href={`${hrefPrefix}/${conversation.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60",
              unread && "bg-primary/5"
            )}
          >
            <Avatar>
              {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm",
                    unread ? "font-semibold" : "font-medium"
                  )}
                >
                  {name}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(conversation.updated_at)}
                </span>
              </div>
              <p
                className={cn(
                  "truncate text-sm",
                  unread ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {preview}
              </p>
            </div>

            {unread && (
              <span className="size-2.5 shrink-0 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
