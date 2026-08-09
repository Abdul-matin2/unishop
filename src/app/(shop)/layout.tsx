import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/lib/actions/cart.actions";
import { getUnreadMessageCount } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Shop — UniShop",
    template: "%s — UniShop",
  },
  description:
    "Browse thousands of products from trusted campus businesses — textbooks, electronics, fashion, food, and more.",
};

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const cartCount = await getCartCount();
  const messageCount = user ? await getUnreadMessageCount(user.id) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        user={
          user
            ? {
                name: user.full_name ?? user.email,
                email: user.email,
                role: user.role,
              }
            : null
        }
        cartCount={cartCount}
        messageCount={messageCount}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
