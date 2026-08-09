"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  GHANAIAN_INSTITUTIONS,
  PRODUCT_CONDITIONS,
  ROUTES,
} from "@/lib/constants";
import type { Category, Product } from "@/lib/types";

interface ProductFormProps {
  /** Server action used to submit the form (createProduct or bound updateProduct). */
  action: (formData: FormData) => Promise<{ error?: string } | void> | void;
  categories: Category[];
  /** Pre-fill data for the edit view. */
  initial?: Product;
}

export function ProductForm({ action, categories, initial }: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file later.
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to upload an image.");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (error) {
        toast.error(error.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(publicUrl);
      toast.success("Image uploaded.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      action={action as unknown as (formData: FormData) => void | Promise<void>}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Wireless Bluetooth Headphones"
              defaultValue={initial?.title}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="category_id"
                defaultValue={initial?.category_id}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                name="condition"
                defaultValue={initial?.condition ?? "new"}
              >
                <SelectTrigger id="condition" className="w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe your product — condition, features, what's included…"
              defaultValue={initial?.description ?? ""}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Legon, Accra"
                defaultValue={initial?.location ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution-input">
                Institution{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <Combobox
                  items={GHANAIAN_INSTITUTIONS}
                  name="institution"
                  defaultValue={initial?.institution ?? null}
                  autoHighlight
                >
                  <ComboboxInput
                    id="institution-input"
                    placeholder="Search institution…"
                    className="pr-8"
                  />
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <ComboboxContent>
                    <ComboboxEmpty>No institutions found</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price (GHS)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="29.99"
                defaultValue={initial?.price}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_price">
                Original Price{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="49.99"
                defaultValue={initial?.original_price ?? undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                step="1"
                placeholder="25"
                defaultValue={initial?.stock_quantity}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Product Image</Label>
          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
            disabled={uploading}
          />
          {imageUrl ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-square w-full bg-muted">
                <Image
                  src={imageUrl}
                  alt="Product preview"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between border-t border-border p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <RefreshCw className="size-4" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setImageUrl("")}
                  disabled={uploading}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              {uploading ? (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                  </span>
                  <span className="text-sm font-medium">Uploading…</span>
                </>
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <ImagePlus className="size-6" />
                  </span>
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG or WEBP up to 5MB
                  </span>
                </>
              )}
            </label>
          )}
          {/* Carried through to the server action on submit. */}
          <input type="hidden" name="image_url" value={imageUrl} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : initial ? "Save Changes" : "Create Product"}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={ROUTES.businessProducts} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
