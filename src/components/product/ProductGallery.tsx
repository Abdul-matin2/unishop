"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/**
 * Main product image with a selectable thumbnail row. Falls back to the
 * first image when the product only has one.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = images.length > 0 ? images : [];

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted ring-1 ring-border">
        <p className="text-sm text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border">
        <Image
          src={gallery[activeIndex]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2">
          {gallery.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={cn(
                "relative size-16 overflow-hidden rounded-lg bg-muted ring-1 ring-border transition sm:size-20",
                index === activeIndex && "ring-2 ring-primary"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
