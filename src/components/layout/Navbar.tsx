"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  UserPlus,
} from "lucide-react";

import { signOut } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryIcon } from "@/components/shared/category-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface NavbarUser {
  name: string;
  email: string;
  role: "student" | "business" | "admin";
}

interface NavbarProps {
  user?: NavbarUser | null;
  cartCount?: number;
  /** Unread message count across the user's inbox (badge on the Inbox link). */
  messageCount?: number;
}

const navLinkClass =
  "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground";

const mobileLinkClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function Navbar({
  user = null,
  cartCount = 0,
  messageCount = 0,
}: NavbarProps = {}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-appropriate account links for the user dropdown / mobile menu.
  const accountLinks = (() => {
    if (user?.role === "business") {
      return [
        {
          href: ROUTES.businessDashboard,
          label: "Business Dashboard",
          icon: LayoutDashboard,
          badge: 0,
        },
        {
          href: ROUTES.businessInbox,
          label: "Inbox",
          icon: MessageSquare,
          badge: messageCount,
        },
      ];
    }
    if (user?.role === "admin") {
      return [
        {
          href: ROUTES.adminDashboard,
          label: "Admin Dashboard",
          icon: LayoutDashboard,
          badge: 0,
        },
      ];
    }
    // Student
    return [
      {
        href: ROUTES.studentOrders,
        label: "My Orders",
        icon: Package,
        badge: 0,
      },
      {
        href: ROUTES.studentInbox,
        label: "Inbox",
        icon: MessageSquare,
        badge: messageCount,
      },
      {
        href: ROUTES.studentWishlist,
        label: "Wishlist",
        icon: Heart,
        badge: 0,
      },
    ];
  })();

  const handleSearch = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : ROUTES.shop);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.home);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        {/* Mobile hamburger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-lg" }),
              "md:hidden"
            )}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>

          <SheetContent side="left" className="w-[300px] sm:w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShoppingBag className="size-4" />
                </span>
                UniShop
              </SheetTitle>
              <SheetDescription>
                Everything you need for campus life.
              </SheetDescription>
            </SheetHeader>

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-4" role="search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-full pl-9"
                />
              </div>
            </form>

            {/* Mobile nav */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-6">
              <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Browse
              </p>
              <Link
                href={ROUTES.shop}
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                <ShoppingBag className="size-4 text-primary" />
                Shop All
              </Link>

              <p className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Categories
              </p>
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${category.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileLinkClass}
                >
                  <CategoryIcon
                    name={category.icon}
                    className="size-4 text-primary"
                  />
                  {category.name}
                </Link>
              ))}

              <p className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Account
              </p>
              {user ? (
                <>
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={mobileLinkClass}
                    >
                      <link.icon className="size-4 text-primary" />
                      {link.label}
                      {link.badge > 0 && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className={mobileLinkClass}
                  >
                    <LogOut className="size-4 text-primary" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.login}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <LogIn className="size-4 text-primary" />
                    Login
                  </Link>
                  <Link
                    href={ROUTES.signup}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <UserPlus className="size-4 text-primary" />
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBag className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            Uni<span className="text-primary">Shop</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link href={ROUTES.shop} className={navLinkClass}>
            Shop
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-1"
              )}
            >
              Categories
              <ChevronDown className="size-3.5 transition-transform" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>All Categories</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {CATEGORIES.map((category) => (
                <DropdownMenuItem
                  key={category.slug}
                  render={
                    <Link href={`/shop?category=${category.slug}`} />
                  }
                  className="cursor-pointer"
                >
                  <CategoryIcon
                    name={category.icon}
                    className="size-4 text-primary"
                  />
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="relative mx-auto hidden max-w-md flex-1 lg:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search textbooks, gadgets, food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-full pl-9 pr-4"
          />
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          {/* Cart */}
          <Link
            href={ROUTES.cart}
            aria-label={`Cart, ${cartCount} items`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-lg" }),
              "relative"
            )}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
                {cartCount}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden gap-1 md:inline-flex"
              )}
            >
              <User className="size-4" />
              {user?.name ?? "Account"}
              <ChevronDown className="size-3.5 transition-transform" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {user ? (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="truncate text-sm font-medium">
                        {user.name}
                      </span>
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {accountLinks.map((link) => (
                    <DropdownMenuItem
                      key={link.href}
                      render={<Link href={link.href} />}
                      className="cursor-pointer"
                    >
                      <link.icon className="size-4" />
                      {link.label}
                      {link.badge > 0 && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                          {link.badge}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={<Link href={ROUTES.login} />}
                    className="cursor-pointer"
                  >
                    <LogIn className="size-4" />
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={ROUTES.signup} />}
                    className="cursor-pointer"
                  >
                    <UserPlus className="size-4" />
                    Sign Up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
