import { Link, useLocation } from "wouter";
import { Compass, Map as MapIcon, Upload, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Atlas", icon: MapIcon },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/upload", label: "Share", icon: Upload },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary shadow-[0_0_15px_rgba(0,180,255,0.4)]">
          <Headphones size={16} />
        </div>
        <span className="font-mono tracking-widest text-lg font-bold uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          SoundMap
        </span>
      </div>

      <div className="flex items-center gap-1 bg-card/80 backdrop-blur-md p-1.5 rounded-full border border-white/5 pointer-events-auto shadow-xl">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,180,255,0.2)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon size={16} />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="w-[120px] pointer-events-auto" />
    </nav>
  );
}
