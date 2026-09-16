"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tags,
  User,
  Users,
} from "lucide-react";

import { signOut } from "@/lib/actions/auth.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type DashboardVariant = "student" | "business" | "admin";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  variant: DashboardVariant;
  user: { name: string; email?: string; initials: string };
  /** Business name shown at the top of the sidebar (business variant only). */
  businessName?: string;
  children: React.ReactNode;
}

const NAV_ITEMS: Record<DashboardVariant, NavItem[]> = {
  student: [
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/inbox", label: "Inbox", icon: MessageSquare },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ],
  business: [
    { href: "/business/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/business/products", label: "My Products", icon: Package },
    { href: "/business/orders", label: "Orders", icon: ShoppingCart },
    { href: "/business/inbox", label: "Inbox", icon: MessageSquare },
    { href: "/business/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/businesses", label: "Businesses", icon: Building2 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/pages", label: "Pages", icon: FileText },
  ],
};

const BRAND_ICON: Record<DashboardVariant, LucideIcon> = {
  student: ShoppingBag,
  business: ShoppingBag,
  admin: Shield,
};

export function DashboardShell({
  variant,
  user,
  businessName,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const dark = variant === "admin";
  const items = NAV_ITEMS[variant];
  const BrandIcon = BRAND_ICON[variant];
  const brandName =
    variant === "business" ? (businessName ?? "My Business") : "UniShop";
  const roleLabel =
    variant === "student" ? "Student" : variant === "business" ? "Business" : "Admin";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          dark
            ? active
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
            : active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className="size-4 shrink-0" />
        {item.label}
      </Link>
    );
  };

  const renderSidebarInner = () => (
    <div
      className={cn(
        "flex h-full flex-col gap-4 overflow-y-auto p-4",
        dark && "text-white"
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-3 px-2 pt-1 transition-opacity hover:opacity-80"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            dark ? "bg-indigo-500 text-white" : "bg-primary text-primary-foreground"
          )}
        >
          <BrandIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{brandName}</p>
          {variant === "business" ? (
            <p className="text-xs text-muted-foreground">Business Dashboard</p>
          ) : (
            <p className={cn("text-xs", dark ? "text-gray-400" : "text-muted-foreground")}>
              Student Marketplace
            </p>
          )}
        </div>
        {variant === "admin" && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
            Admin Panel
          </span>
        )}
      </Link>

      <nav className="flex flex-1 flex-col gap-1">{items.map(renderNavLink)}</nav>

      <div className="mt-auto flex flex-col gap-1">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2",
            dark ? "bg-white/5" : "bg-muted/50"
          )}
        >
          <Avatar>
            <AvatarFallback
              className={cn(
                "font-medium",
                dark ? "bg-white/10 text-white" : "bg-primary text-primary-foreground"
              )}
            >
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", dark && "text-white")}>
              {user.name}
            </p>
            <p className={cn("truncate text-xs", dark ? "text-gray-400" : "text-muted-foreground")}>
              {roleLabel}
            </p>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              dark
                ? "text-gray-400 hover:bg-white/5 hover:text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LogOut className="size-4 shrink-0" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col md:flex",
          dark ? "bg-gray-900" : "border-r border-border bg-white"
        )}
      >
        {renderSidebarInner()}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <Sheet>
          <SheetTrigger
            aria-label="Open navigation menu"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className={cn("w-72 p-0", dark ? "bg-gray-900" : "bg-white")}
          >
            {renderSidebarInner()}
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              dark ? "bg-indigo-500 text-white" : "bg-primary text-primary-foreground"
            )}
          >
            <BrandIcon className="size-4" />
          </span>
          <span className="text-sm font-semibold">{brandName}</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
