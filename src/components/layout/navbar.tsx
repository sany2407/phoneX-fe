"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { SearchDialog } from "@/components/layout/search-dialog";
import { useCart } from "@/lib/stores/cart-store";
import { useAuth } from "@/lib/stores/auth-store";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { CouponMarquee } from "@/components/layout/coupon-marquee";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop",            label: "Shop" },
  { href: "/devices/phones",  label: "Phones" },
  { href: "/devices/tablets", label: "Tablets" },
  { href: "/devices/laptops", label: "Laptops" },
  { href: "/designs",         label: "Designs" },
  { href: "/customize",       label: "Customize", accent: true },
  { href: "/shop?sort=newest",label: "New" },
  { href: "/offers",          label: "Offers" },
];

function CartBadge() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  if (!count) return null;
  return (
    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const likeCount   = useWishlist((s) => s.slugs.length);
  const user        = useAuth((s) => s.user);
  const signOut     = useAuth((s) => s.signOut);

  return (
    <header className="sticky top-0 z-50 min-w-0 overflow-x-clip">
      {/* ── Announcement bar ── */}
      <CouponMarquee />

      {/* ── Main nav ── */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <nav
          aria-label="Main navigation"
          className="container-x flex h-14 min-w-0 items-center gap-2 sm:h-16 sm:gap-6"
        >
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle><Logo /></SheetTitle>
              </SheetHeader>
              <ul className="space-y-1 p-3">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                        pathname === item.href.split("?")[0] && "bg-muted",
                        item.accent && "text-primary"
                      )}
                    >
                      {item.accent && <Sparkles className="size-3.5 text-primary" aria-hidden="true" />}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>

          <Logo />

          {/* Desktop links */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => {
              const isActive =
                pathname === item.href.split("?")[0] &&
                item.href !== "/shop?sort=newest";
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "text-foreground/60 hover:text-foreground",
                      isActive && "text-foreground",
                      item.accent &&
                        "text-primary hover:text-primary/80 font-semibold"
                    )}
                  >
                    {item.accent && (
                      <Sparkles
                        className="mr-1 inline-block size-3 align-middle"
                        aria-hidden="true"
                      />
                    )}
                    {item.label}
                    {/* active underline pill */}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="text-foreground/70 hover:text-foreground"
            >
              <Search />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Account"
                  className="text-foreground/70 hover:text-foreground"
                >
                  <UserRound />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuLabel className="capitalize">{user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">Profile &amp; addresses</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">My orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/designs">Saved designs</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Sign in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup">Create account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/70 hover:text-foreground"
              aria-label={`Wishlist${likeCount > 0 ? ` (${likeCount})` : ""}`}
              asChild
            >
              <Link href="/wishlist">
                <Heart className={cn("transition-colors", likeCount > 0 && "fill-current text-primary")} />
                {likeCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {likeCount > 9 ? "9+" : likeCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              className="relative text-foreground/70 hover:text-foreground"
              asChild
            >
              <Link href="/cart">
                <ShoppingBag />
                <CartBadge />
              </Link>
            </Button>
          </div>
        </nav>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
