import { Link, useLocation } from "wouter";
import {
  Map as MapIcon,
  Compass,
  CircleDot,
  Radio,
  User,
  Headphones,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsername } from "@/hooks/use-username";
import { useState } from "react";

const links = [
  { href: "/", label: "Atlas", icon: MapIcon },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/upload", label: "Record", icon: CircleDot },
  { href: "/feed", label: "Feed", icon: Radio },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const [location] = useLocation();
  const { username } = useUsername();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* ── DESKTOP: floating left sidebar (hover to expand) ── */}
      <aside
        className={cn(
          "hidden md:flex",
          "fixed left-3 top-1/2 -translate-y-1/2 z-[1000]",
          "flex-col",
          "bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl",
          "transition-all duration-300 ease-in-out overflow-hidden",
          expanded ? "w-52 p-3" : "w-[52px] p-2"
        )}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-1 py-2 mb-1">
          <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary shadow-[0_0_15px_rgba(0,180,255,0.4)]">
            <Headphones size={16} />
          </div>
          <span className={cn(
            "font-mono tracking-widest text-xs font-bold uppercase text-white whitespace-nowrap transition-all duration-300",
            expanded ? "opacity-100" : "opacity-0 w-0"
          )}>
            SoundMap
          </span>
        </div>

        <div className="w-full h-px bg-white/10 mb-1" />

        <nav className="flex flex-col gap-0.5">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium",
                  "transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-white hover:bg-white/10"
                )}>
                  <link.icon size={18} className="shrink-0" />
                  <span className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                  )}>
                    {link.label}
                  </span>
                  {isActive && expanded && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="w-full h-px bg-white/10 mt-1 mb-1" />

        {/* Profile */}
        <Link href="/profile">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <User size={14} className="text-primary" />
            </div>
            <div className={cn(
              "min-w-0 transition-all duration-300",
              expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}>
              <p className="text-xs font-semibold text-white truncate">
                {username ?? "Guest"}
              </p>
              <p className="text-[10px] text-muted-foreground">View profile</p>
            </div>
          </div>
        </Link>

        {/* Logout */}
        <div
          className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors mt-1"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          <div className="w-8 h-8 shrink-0 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <LogOut size={14} className="text-red-400" />
          </div>
          <div className={cn(
            "min-w-0 transition-all duration-300",
            expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          )}>
            <p className="text-xs font-semibold text-red-400">Log out</p>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: anchored bottom bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-black/80 backdrop-blur-md border-t border-white/10 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[56px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}>
                  <link.icon size={20} className={cn(
                    "transition-transform duration-200",
                    isActive ? "scale-110" : ""
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {link.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}