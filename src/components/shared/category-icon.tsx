import { cloneElement } from "react";
import type { ReactElement } from "react";
import {
  BookOpen,
  Coffee,
  Home,
  Laptop,
  Package,
  Shirt,
  Wrench,
} from "lucide-react";

/**
 * Maps the category `icon` string (e.g. "BookOpen") from the CATEGORIES
 * constant to a pre-instantiated lucide icon element. Elements are created
 * once at module scope so the `react-hooks/static-components` rule is
 * satisfied and icons never lose state between renders. Unknown or missing
 * icon names fall back to a generic Package icon.
 */
const CATEGORY_ICON_ELEMENTS: Record<
  string,
  ReactElement<{ className?: string }>
> = {
  BookOpen: <BookOpen aria-hidden="true" />,
  Coffee: <Coffee aria-hidden="true" />,
  Home: <Home aria-hidden="true" />,
  Laptop: <Laptop aria-hidden="true" />,
  Package: <Package aria-hidden="true" />,
  Shirt: <Shirt aria-hidden="true" />,
  Wrench: <Wrench aria-hidden="true" />,
};

interface CategoryIconProps {
  name?: string | null;
  className?: string;
}

/**
 * Renders the icon for a category. Works in both Server and Client
 * components since lucide-react icons are SSR-safe.
 */
export function CategoryIcon({ name, className }: CategoryIconProps) {
  const element =
    (name ? CATEGORY_ICON_ELEMENTS[name] : undefined) ??
    CATEGORY_ICON_ELEMENTS.Package;

  return cloneElement(element, { className });
}
