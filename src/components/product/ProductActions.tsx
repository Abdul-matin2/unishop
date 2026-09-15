import { Phone } from "lucide-react";

import { buildWhatsAppHref, cn, telHref } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

interface ProductActionsProps {
  phone: string | null;
  businessName?: string | null;
  productTitle: string;
}

/**
 * Contact-the-seller controls for the product page: call the phone number or
 * open WhatsApp with a pre-filled message. There's no cart / Buy Now flow —
 * the buyer arranges pickup directly with the seller.
 */
export function ProductActions({
  phone,
  businessName,
  productTitle,
}: ProductActionsProps) {
  const phoneHref = phone ? telHref(phone) : null;
  const whatsappHref = phone
    ? buildWhatsAppHref(
        phone,
        `Hi ${businessName ?? "there"}, I'm interested in "${productTitle}" on UniShop. Is it still available?`
      )
    : null;

  if (!phoneHref || !whatsappHref) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          This seller has not added a phone number yet — send them a message
          below instead.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={phoneHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "flex-1"
        )}
      >
        <Phone className="size-4" />
        Call Seller
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "flex-1 bg-[#25D366] text-white hover:bg-[#1DA851]"
        )}
      >
        <WhatsAppIcon className="size-4" />
        WhatsApp Seller
      </a>
    </div>
  );
}

export default ProductActions;