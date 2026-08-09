"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  markConversationRead,
  sendMessage,
} from "@/lib/actions/message.actions";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ConversationThreadProps {
  conversationId: string;
  /** Current signed-in user id — determines which side is "mine". */
  userId: string;
  /** Display name of the other party (business name or buyer name). */
  otherName: string;
  subject?: string | null;
  initialMessages: Message[];
}

export function ConversationThread({
  conversationId,
  userId,
  otherName,
  subject,
  initialMessages,
}: ConversationThreadProps) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark the other party's messages as read when the thread opens.
  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId]);

  // Scroll to the newest message on load and whenever new ones arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [initialMessages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      const result = await sendMessage(conversationId, body);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setDraft("");
      router.refresh();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Thread header */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="truncate text-sm font-semibold">
          {subject || otherName}
        </h2>
        <p className="truncate text-xs text-muted-foreground">
          Conversation with {otherName}
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4"
      >
        {initialMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello to get the conversation started!
          </p>
        ) : (
          initialMessages.map((message) => {
            const mine = message.sender_id === userId;
            return (
              <div
                key={message.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[70%]",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-background ring-1 ring-border"
                  )}
                >
                  <p className="break-words whitespace-pre-wrap">
                    {message.body}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply box */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Reply to ${otherName}...`}
            rows={2}
            className="max-h-40 flex-1 resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="shrink-0"
            aria-label="Send message"
          >
            <Send className="size-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
