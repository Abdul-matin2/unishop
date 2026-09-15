import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  return new Date(iso).toLocaleDateString("en-US", options)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount)
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Normalize a stored business phone to international digits (Ghana, +233)
 * without the "+" — the form wa.me and tel: links expect.
 * Returns null when the number doesn't look usable, so callers can fall back.
 */
export function toInternationalDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 9 || digits.length > 15) return null
  // Already in international form (+233…, +1…, +44…) — use as-is.
  if (digits.length >= 11) return digits
  // Ghanaian national formats:
  if (digits.length === 10 && digits.startsWith("0")) return `233${digits.slice(1)}` // 024…
  if (digits.length === 9) return `233${digits}` // 24… (leading 0 dropped)
  return null
}

/** A tel: href for calling the seller from a mobile phone. */
export function telHref(phone: string): string | null {
  const digits = toInternationalDigits(phone)
  return digits ? `tel:+${digits}` : null
}

/** A wa.me href that opens WhatsApp with a pre-filled message. */
export function buildWhatsAppHref(
  phone: string,
  message: string
): string | null {
  const digits = toInternationalDigits(phone)
  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : null
}
