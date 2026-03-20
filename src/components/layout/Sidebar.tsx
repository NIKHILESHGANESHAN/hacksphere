"use client";

import { Home, Compass, MessageSquare, Users, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Discover", href: "/discover", icon: Compass },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "XConnect", href: "/xconnect", icon: Users },
  { name: "Clubs", href: "/clubs", icon: Users },
  { name: "Profile", href: "/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-background/50 backdrop-blur-xl border-r-white/10 fixed left-0 top-0 flex flex-col p-4 z-40 hidden md:flex">
      <div className="flex items-center gap-2 mb-8 px-2 mt-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="font-bold text-white text-sm">H</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">HackSphere</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                isActive 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", isActive ? "scale-110 text-primary" : "group-hover:scale-110")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile Skeleton / Mini-profile spot */}
      <div className="mt-auto border-t border-white/10 pt-6 px-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="h-4 w-20 bg-white/10 rounded animate-pulse mb-1" />
            <span className="h-3 w-12 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}
