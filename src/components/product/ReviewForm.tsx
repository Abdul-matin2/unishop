"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { submitReview } from "@/lib/actions/review.actions";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
}

/**
 * "Write a Review" form. Collects a rating and comment locally, then sends
 * them through the `submitReview` server action.
 */
export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const activeRating = hoveredRating || rating;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setPending(true);
    const result = await submitReview({
      productId,
      productSlug,
      rating,
      comment,
    });
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      if (result.error.toLowerCase().includes("log in")) {
        router.push(ROUTES.login);
      }
      return;
    }

    toast.success("Review submitted. Thanks for your feedback!");
    setRating(0);
    setComment("");
    router.refresh();
  };

  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-border">
      <h3 className="font-medium">Write a Review</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Share your experience with this product.
      </p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                activeRating >= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating}/5` : "Select a rating"}
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor={`review-comment-${productId}`}>Your review</Label>
        <Textarea
          id={`review-comment-${productId}`}
          name="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you like or dislike?"
          className="bg-background"
        />
      </div>

      <Button
        className="mt-4 w-full"
        disabled={rating === 0 || pending}
        onClick={handleSubmit}
      >
        Submit Review
      </Button>
    </div>
  );
}
