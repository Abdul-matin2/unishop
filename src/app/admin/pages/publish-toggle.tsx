"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { togglePagePublished } from "@/lib/actions/pages.actions";

interface PublishToggleProps {
  pageId: string;
  pageTitle: string;
  published: boolean;
}

/**
 * Publish / unpublish a content page from the admin list. Unpublishing hides
 * the page from the public site immediately.
 */
export function PublishToggle({
  pageId,
  pageTitle,
  published,
}: PublishToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(published);

  const handleToggle = () => {
    const next = !isPublished;
    startTransition(async () => {
      const result = await togglePagePublished(pageId, next);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsPublished(next);
        toast.success(next ? `"${pageTitle}" published` : `"${pageTitle}" hidden`);
        router.refresh();
      }
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isPublished ? `Hide ${pageTitle}` : `Publish ${pageTitle}`}
      title={isPublished ? "Hide from public" : "Publish to public"}
    >
      {isPublished ? <Eye /> : <EyeOff />}
    </Button>
  );
}

export default PublishToggle;