import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllPages } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PublishToggle } from "./publish-toggle";

export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Pages</h1>
        <p className="mt-1 text-muted-foreground">
          Manage the text of the public pages — About, Contact, FAQ, Help,
          Shipping, Returns, and Privacy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
          <CardDescription>
            {pages.length} pages — editing saves instantly to the live site.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="font-medium">{page.title}</div>
                    {page.subtitle && (
                      <div className="max-w-xs truncate text-xs text-muted-foreground">
                        {page.subtitle}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      /{page.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        page.is_published
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {page.is_published ? "Published" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(page.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={
                          <Link href={`/admin/pages/${page.id}/edit`} />
                        }
                        aria-label={`Edit ${page.title}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href={`/${page.slug}`} />}
                        aria-label={`View ${page.title}`}
                      >
                        <Eye />
                      </Button>
                      <PublishToggle
                        pageId={page.id}
                        pageTitle={page.title}
                        published={page.is_published}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}