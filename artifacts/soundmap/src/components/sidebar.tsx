import { Link, useLocation } from "wouter";
import {
  Map as MapIcon,
  Compass,
  CircleDot,
  Radio,
  User,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsername } from "@/hooks/use-username";

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

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 z-[1000] flex flex-col bg-background border-r border-white/5 shrink-0">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary shadow-[0_0_15px_rgba(0,180,255,0.4)] shrink-0">
          <Headphones size={18} />
        </div>
        <span className="font-mono tracking-widest text-base font-bold uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          SoundMap
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(0,180,255,0.1)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <Link href="/profile">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <User size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              {username ? (
                <>
                  <p className="text-sm font-semibold text-white truncate">{username}</p>
                  <p className="text-xs text-muted-foreground">View profile</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-white">Guest</p>
                  <p className="text-xs text-muted-foreground">Set up profile</p>
                </>
              )}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
