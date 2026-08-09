import { Star, StarHalf } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  count: number;
}

/**
 * Renders a 5-star rating display with filled, half-filled, and empty
 * stars, plus a review count like "(12)".
 */
export function RatingStars({ rating, count }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const fill = Math.min(Math.max(rating - index, 0), 1);
          if (fill >= 0.75) {
            return (
              <Star
                key={index}
                className="size-3.5 fill-amber-400 text-amber-400"
              />
            );
          }
          if (fill >= 0.25) {
            return (
              <StarHalf
                key={index}
                className="size-3.5 fill-amber-400 text-amber-400"
              />
            );
          }
          return <Star key={index} className="size-3.5 text-gray-300" />;
        })}
      </div>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

export default RatingStars;
