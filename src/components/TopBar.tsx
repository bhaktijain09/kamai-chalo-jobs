import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut } from "lucide-react";

export function TopBar({ showAuth = true }: { showAuth?: boolean }) {
  const { user, role, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Blue<span className="text-primary">Collar</span>
          </span>
        </Link>
        {showAuth && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {role === "employer" ? (
                  <Button asChild size="sm" variant="ghost"><Link to="/employer/dashboard">Dashboard</Link></Button>
                ) : role === "worker" ? (
                  <Button asChild size="sm" variant="ghost"><Link to="/dashboard">Dashboard</Link></Button>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost"><Link to="/login">Login</Link></Button>
                <Button asChild size="sm" className="rounded-full"><Link to="/signup" search={{ role: "worker" }}>Sign up</Link></Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
