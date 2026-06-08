import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";
import { timeAgo, formatSalary } from "@/lib/format";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/applications")({ component: AppsPage });

const STATUS_LABELS = {
  applied: { label: "Applied", color: "bg-trust/10 text-trust" },
  viewed: { label: "Viewed", color: "bg-warning/15 text-warning-foreground" },
  shortlisted: { label: "Shortlisted", color: "bg-primary/15 text-primary" },
  interview: { label: "Interview", color: "bg-accent text-accent-foreground" },
  hired: { label: "Hired 🎉", color: "bg-success/15 text-success" },
  rejected: { label: "Not selected", color: "bg-muted text-muted-foreground" },
} as const;

function AppsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { unreadByApp } = useUnreadMessages();

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,status,applied_at,jobs(id,title,city,area,salary_min,salary_max,employers(company_name,logo_url))")
        .eq("worker_id", user!.id)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="mx-auto max-w-3xl px-4 py-5">
        <h1 className="text-2xl font-extrabold">My applications</h1>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : data && data.length > 0 ? (
            data.map((a) => {
              const job = a.jobs as any;
              const status = STATUS_LABELS[a.status as keyof typeof STATUS_LABELS];
              const unread = unreadByApp[a.id] ?? 0;
              return (
                <div key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-primary/30">
                  <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 font-semibold">{job.title}</h3>
                        <p className="text-xs text-muted-foreground">{job.employers?.company_name} · {job.city}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatSalary(job.salary_min, job.salary_max)}</p>
                      </div>
                      <Badge className={`shrink-0 rounded-full border-0 ${status.color}`}>{status.label}</Badge>
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">Applied {timeAgo(a.applied_at)}</div>
                  </Link>
                  <Link
                    to="/chat/$applicationId"
                    params={{ applicationId: a.id }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Chat
                    {unread > 0 && (
                      <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No applications yet.</p>
              <Button asChild className="mt-4 rounded-full"><Link to="/jobs">Find jobs</Link></Button>
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
