import { Link, useLocation } from "@tanstack/react-router";
import { Home, Briefcase, FileText, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

const items = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/applications", icon: FileText, label: "Applied" },
  { to: "/saved", icon: Bookmark, label: "Saved" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function MobileNav() {
  const { pathname } = useLocation();
  const { totalUnread } = useUnreadMessages();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.to || (it.to !== "/dashboard" && pathname.startsWith(it.to));
          const Icon = it.icon;
          const showBadge = it.to === "/applications" && totalUnread > 0;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {showBadge && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
