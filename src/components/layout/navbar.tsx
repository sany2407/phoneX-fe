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
import { useLike } from "@/lib/stores/like-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/devices/phones", label: "Phones" },
  { href: "/devices/laptops", label: "Laptops" },
  { href: "/designs", label: "Designs" },
  { href: "/customize", label: "Customize" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/offers", label: "Offers" },
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
  const liked = useLike((s) => s.liked);
  const likeCount = useLike((s) => s.count);
  const toggleLike = useLike((s) => s.toggle);
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  return (
    <header className="sticky top-0 z-50 min-w-0 overflow-x-clip">
      <div className="bg-foreground px-4 py-2 text-center">
        <p className="text-pretty text-xs font-medium tracking-wide text-background/90">
          Free shipping over ₹499 · Extra 10% off with code{" "}
          <span className="font-bold">PHONE10</span>
        </p>
      </div>
      <div className="border-b bg-background/90 backdrop-blur-md">
        <nav
          aria-label="Main navigation"
          className="container-x flex h-14 min-w-0 items-center gap-2 sm:h-16 sm:gap-6"
        >
          {/* mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <ul className="space-y-1 p-3">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted",
                        pathname === item.href && "bg-muted"
                      )}
                    >
                      {item.label === "Customize" && (
                        <Sparkles className="mr-2 size-4 text-primary" />
                      )}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>

          <Logo className="min-w-0 [&_span:last-child]:hidden min-[380px]:[&_span:last-child]:inline" />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground",
                    pathname === item.href.split("?")[0] &&
                      item.href !== "/shop?sort=newest" &&
                      "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <UserRound />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuLabel className="capitalize">{user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">Profile & addresses</Link>
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
              className="relative"
              aria-pressed={liked}
              aria-label={liked ? `Unlike (${likeCount})` : `Like (${likeCount})`}
              onClick={toggleLike}
            >
              <Heart className={cn(liked && "fill-current text-primary")} />
              {likeCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {likeCount > 9 ? "9+" : likeCount}
                </span>
              ) : null}
            </Button>

            <Button variant="ghost" size="icon" aria-label="Cart" asChild>
              <Link href="/cart" className="relative">
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
