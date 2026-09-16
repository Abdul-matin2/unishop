import type { ReactNode } from "react";

import { InfoHeader } from "@/components/pages/InfoHeader";
import { PageContent } from "@/components/pages/PageContent";
import { formatDate } from "@/lib/utils";
import type { Page } from "@/lib/types";

interface ManagedPageProps {
  /** The content page row fetched from the DB via getPageBySlug. */
  page: Page;
  /** Lucide icon shown beside the title in the header band. */
  icon: ReactNode;
}

/**
 * Generic layout for admin-managed content pages (About, FAQ, Privacy, ...).
 * Renders the page's title/subtitle in the header band and its formatted
 * content below, with a "last updated" line.
 */
export function ManagedPage({ page, icon }: ManagedPageProps) {
  return (
    <>
      <InfoHeader
        icon={icon}
        title={page.title}
        subtitle={page.subtitle ?? undefined}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <PageContent content={page.content} />

        <p className="mt-14 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Last updated {formatDate(page.updated_at)}
        </p>
      </div>
    </>
  );
}

export default ManagedPage;