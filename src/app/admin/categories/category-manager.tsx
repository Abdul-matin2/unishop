"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Pencil, Plus, Power, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createCategory,
  toggleCategory,
  updateCategory,
} from "@/lib/actions/category.actions";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

interface CategoryManagerProps {
  categories: Category[];
  productCounts?: Record<string, number>;
}

export function CategoryManager({
  categories: initial,
  productCounts = {},
}: CategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", slug: "" });
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });

  const startAdd = () => {
    setAdding(true);
    setEditingId(null);
    setNewCategory({ name: "", slug: "" });
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setAdding(false);
    setDraft({ name: category.name, slug: category.slug });
  };

  const handleAdd = () => {
    const name = newCategory.name.trim();
    const slug = newCategory.slug.trim() || slugify(name);
    if (!name || !slug) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", "");
    formData.append("icon", "");
    formData.append("sort_order", String(categories.length));

    startTransition(async () => {
      const result = await createCategory(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCategories((prev) => [
          ...prev,
          {
            id: `new-${Date.now()}`,
            name,
            slug,
            description: null,
            icon: null,
            sort_order: categories.length,
            is_active: true,
          },
        ]);
        setAdding(false);
        setNewCategory({ name: "", slug: "" });
        toast.success("Category created");
        router.refresh();
      }
    });
  };

  const handleSave = (id: string) => {
    const name = draft.name.trim();
    const slug = draft.slug.trim() || slugify(name);
    if (!name || !slug) return;

    const existing = categories.find((category) => category.id === id);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", existing?.description ?? "");
    formData.append("icon", existing?.icon ?? "");
    formData.append("sort_order", String(existing?.sort_order ?? 0));

    startTransition(async () => {
      const result = await updateCategory(id, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === id ? { ...category, name, slug } : category
          )
        );
        setEditingId(null);
        toast.success("Category updated");
        router.refresh();
      }
    });
  };

  const handleToggleActive = (category: Category) => {
    const nextActive = !category.is_active;
    startTransition(async () => {
      const result = await toggleCategory(category.id, nextActive);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === category.id ? { ...c, is_active: nextActive } : c
          )
        );
        toast.success(nextActive ? "Category activated" : "Category deactivated");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {categories.length} categories
        </p>
        {!adding && (
          <Button onClick={startAdd} disabled={isPending}>
            <Plus />
            Add Category
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adding && (
              <TableRow className="bg-muted/40">
                <TableCell>
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="category-slug"
                    value={newCategory.slug}
                    onChange={(e) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                  />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  —
                </TableCell>
                <TableCell className="text-muted-foreground">New</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon-sm"
                      disabled={isPending}
                      onClick={handleAdd}
                      aria-label="Save category"
                    >
                      <Check />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setAdding(false)}
                      aria-label="Cancel"
                    >
                      <X />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {categories.map((category) => {
              const editing = editingId === category.id;
              return (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {editing ? (
                      <Input
                        value={draft.name}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    ) : (
                      category.name
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {editing ? (
                      <Input
                        value={draft.slug}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, slug: e.target.value }))
                        }
                      />
                    ) : (
                      category.slug
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {productCounts[category.id] ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        category.is_active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editing ? (
                        <>
                          <Button
                            size="icon-sm"
                            disabled={isPending}
                            onClick={() => handleSave(category.id)}
                            aria-label="Save changes"
                          >
                            <Check />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel edit"
                          >
                            <X />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => startEdit(category)}
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isPending}
                            onClick={() => handleToggleActive(category)}
                            aria-label={
                              category.is_active
                                ? `Deactivate ${category.name}`
                                : `Activate ${category.name}`
                            }
                          >
                            <Power />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
