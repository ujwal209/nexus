"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  Bell,
  Compass,
  User,
  Settings,
  LogOut,
  Sparkles,
  Command,
} from "lucide-react";

// shadcn UI Primitives
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Discover", href: "/discover" },
  { label: "Playlists", href: "/playlists", badge: "New" },
  { label: "Artists", href: "/artists" },
  { label: "Charts", href: "/charts" },
];

export function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/75 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* BRAND LOGO */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-foreground font-sans">
                ROADWAYS
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest font-mono">
                Studio
              </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SEARCH BAR (Desktop) */}
        <div className="hidden lg:flex items-center relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists..."
            className="pl-9 pr-12 text-xs h-9 bg-card/60 border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border bg-muted/60 px-1.5 text-[10px] font-mono text-muted-foreground">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </div>

        {/* RIGHT CONTROLS & PROFILE */}
        <div className="flex items-center gap-2">
          {/* Notifications Trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 bg-card border-border">
              <DropdownMenuLabel className="text-xs font-semibold">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2 text-xs text-muted-foreground text-center">
                No new notifications
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 border border-border/80">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" />
                  <AvatarFallback>AK</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 bg-card border-border">
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-foreground leading-none">Arjun Kumar</p>
                  <p className="text-[11px] text-muted-foreground leading-none font-mono">arjun@roadways.io</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                <User className="h-3.5 w-3.5" /> Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                <Settings className="h-3.5 w-3.5" /> Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs gap-2 text-red-400 focus:text-red-400 cursor-pointer">
                <LogOut className="h-3.5 w-3.5" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* MOBILE MENU TRIGGER (Sheet Drawer) */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card border-border p-6">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="flex items-center gap-2 text-base font-bold">
                    <Compass className="h-5 w-5 text-primary" /> ROADWAYS
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 text-xs h-9 bg-background border-border"
                  />
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-2">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-lg hover:bg-muted/50"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

      </div>
    </header>
  );
}