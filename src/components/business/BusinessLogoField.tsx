"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface BusinessLogoFieldProps {
  /** Existing logo URL for the edit view. */
  initialUrl?: string | null;
}

/**
 * Uploads a business logo to the `business-logos/{user.id}/` folder in the
 * browser, then carries the public URL to the server action via a hidden
 * `logo_url` input. Mirrors the product image upload in ProductForm.
 */
export function BusinessLogoField({ initialUrl }: BusinessLogoFieldProps) {
  const [logoUrl, setLogoUrl] = useState(initialUrl ?? "");
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
      toast.error("Logo must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to upload a logo.");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("business-logos")
        .upload(path, file);

      if (error) {
        toast.error(error.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("business-logos").getPublicUrl(path);
      setLogoUrl(publicUrl);
      toast.success("Logo uploaded.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Business Logo</Label>
      <input
        ref={fileInputRef}
        id="logo-upload"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleImageChange}
        disabled={uploading}
      />
      {logoUrl ? (
        <div className="w-fit overflow-hidden rounded-xl border border-border">
          <div className="relative size-32 bg-muted">
            <Image
              src={logoUrl}
              alt="Business logo preview"
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-1 border-t border-border p-1.5">
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
              onClick={() => setLogoUrl("")}
              disabled={uploading}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="logo-upload"
          className="flex aspect-square size-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-3 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="text-xs font-medium">Uploading…</span>
            </>
          ) : (
            <>
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ImagePlus className="size-5" />
              </span>
              <span className="text-xs font-medium">Upload logo</span>
            </>
          )}
        </label>
      )}
      {/* Carried through to the server action on submit. */}
      <input type="hidden" name="logo_url" value={logoUrl} />
      <p className="text-xs text-muted-foreground">
        PNG, JPG or WEBP up to 5MB. A square image works best.
      </p>
    </div>
  );
}
