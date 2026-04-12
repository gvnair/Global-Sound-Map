import { Link, useLocation } from "wouter";
import { Compass, Map as MapIcon, CircleDot, Headphones, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);

  const links = [
    { href: "/", label: "Atlas", icon: MapIcon },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/upload", label: "Record", icon: CircleDot },
    { href: "/feed", label: "Feed", icon: Radio },
  ];

  return (
    <nav
      className={cn(
        "fixed top-1/2 left-3 -translate-y-1/2 z-[1000]",
        "flex flex-col items-start gap-1",
        "bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl",
        "transition-all duration-300 ease-in-out overflow-hidden",
        expanded ? "w-44 p-3" : "w-14 p-2"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-1 py-2 mb-1 w-full">
        <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary shadow-[0_0_15px_rgba(0,180,255,0.4)]">
          <Headphones size={16} />
        </div>
        <span
          className={cn(
            "font-mono tracking-widest text-xs font-bold uppercase text-white whitespace-nowrap",
            "transition-all duration-300",
            expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
          )}
        >
          SoundMap
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/10 mb-1" />

      {/* Nav links */}
      {links.map((link) => {
        const isActive = location === link.href;
        return (
          <Link key={link.href} href={link.href} className="w-full">
            <div
              className={cn(
                "flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-200 cursor-pointer w-full",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-white hover:bg-white/10"
              )}
            >
              <link.icon size={18} className="shrink-0" />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}
              >
                {link.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}