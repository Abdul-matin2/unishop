import { Phone } from "lucide-react";

import { buildWhatsAppHref, cn, telHref } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { ContactGate } from "@/components/shared/ContactGate";

interface ProductActionsProps {
  whatsappNumber: string | null;
  callNumber: string | null;
  businessName?: string | null;
  productTitle: string;
}

/**
 * Contact-the-seller controls for the product page: call the call number or
 * open WhatsApp with a pre-filled message to the WhatsApp number. There's no
 * cart / Buy Now flow — the buyer arranges pickup directly with the seller.
 * The buttons always render; each is disabled only when its number is missing.
 */
export function ProductActions({
  whatsappNumber,
  callNumber,
  businessName,
  productTitle,
}: ProductActionsProps) {
  const phoneHref = callNumber ? telHref(callNumber) : null;
  const whatsappHref = whatsappNumber
    ? buildWhatsAppHref(
        whatsappNumber,
        `Hi ${businessName ?? "there"}, I'm interested in "${productTitle}" on UniShop. Is it still available?`
      )
    : null;

  const noPhoneHint = "This seller has not added a phone number yet";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <ContactGate
          href={phoneHref ?? undefined}
          tabIndex={phoneHref ? undefined : -1}
          aria-disabled={!phoneHref || undefined}
          title={phoneHref ? undefined : noPhoneHint}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "flex-1",
            !phoneHref && "pointer-events-none opacity-50"
          )}
        >
          <Phone className="size-4" />
          Call Seller
        </ContactGate>
        <ContactGate
          href={whatsappHref ?? undefined}
          tabIndex={whatsappHref ? undefined : -1}
          aria-disabled={!whatsappHref || undefined}
          title={whatsappHref ? undefined : noPhoneHint}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "flex-1 bg-[#25D366] text-white hover:bg-[#1DA851]",
            !whatsappHref && "pointer-events-none opacity-50"
          )}
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp Seller
        </ContactGate>
      </div>
      {(!phoneHref || !whatsappHref) && (
        <p className="text-sm text-muted-foreground">
          {noPhoneHint} — message them below instead.
        </p>
      )}
    </div>
  );
}

export default ProductActions;