"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePage } from "@/lib/actions/pages.actions";
import type { Page } from "@/lib/types";

interface PageFormProps {
  page: Page;
}

/**
 * Admin editor for a content page. Saves title, subtitle, and body directly;
 * the change goes live immediately.
 */
export function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updatePage(page.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${formData.get("title")}" saved — changes are live.`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/pages"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to pages
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit page</h1>
          <p className="mt-1 text-muted-foreground">{`/${page.slug}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/${page.slug}`} />}
          >
            View live page
          </Button>
          <Button type="submit" form="page-form" disabled={isPending}>
            <Save className="size-4" />
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <form
        id="page-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 rounded-2xl bg-card p-6 ring-1 ring-border"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="page-title">Page title</Label>
          <Input
            id="page-title"
            name="title"
            defaultValue={page.title}
            placeholder="About UniShop"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="page-subtitle">
            Subtitle <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="page-subtitle"
            name="subtitle"
            defaultValue={page.subtitle ?? ""}
            placeholder="A short line shown under the title."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="page-content">Page content</Label>
          <Textarea
            id="page-content"
            name="content"
            defaultValue={page.content}
            rows={18}
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            Formatting: <code className="rounded bg-muted px-1">## Heading</code>{" "}
            for section titles,{" "}
            <code className="rounded bg-muted px-1">### Sub-heading</code> for
            smaller titles, lines starting with{" "}
            <code className="rounded bg-muted px-1">- </code> become bullets,
            and a blank line starts a new paragraph.
          </p>
        </div>
      </form>
    </div>
  );
}

export default PageForm;