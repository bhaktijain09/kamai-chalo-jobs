import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { MessageCircle, Check, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { CATEGORIES } from "@/lib/format";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

export const Route = createFileRoute("/employer/jobs/$jobId/applicants")({ component: ApplicantsPage });

type AppStatus = "applied" | "viewed" | "shortlisted" | "interview" | "hired" | "rejected";

function ApplicantsPage() {
  const { jobId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { unreadByApp } = useUnreadMessages();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const { data: job } = useQuery({
    queryKey: ["job-mgmt", jobId],
    queryFn: async () => (await supabase.from("jobs").select("title,city,category,salary_min,salary_max,experience_required").eq("id", jobId).maybeSingle()).data,
  });

  const { data: apps, isLoading } = useQuery({
    queryKey: ["job-apps", jobId],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id,status,applied_at,profiles!applications_worker_id_profiles_fkey(id,name,phone,city,experience_years,salary_expectation,preferred_category,languages)")
        .eq("job_id", jobId)
        .order("applied_at", { ascending: false });
      return data ?? [];
    },
  });

  // Realtime: refresh when new applications arrive
  useEffect(() => {
    const channel = supabase
      .channel(`apps:${jobId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "applications", filter: `job_id=eq.${jobId}` }, () => {
        qc.invalidateQueries({ queryKey: ["job-apps", jobId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [jobId, qc]);

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppStatus }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["job-apps", jobId] }); toast.success("Updated"); },
  });

  const computeMatch = (p: any) => {
    if (!job || !p) return 0;
    let s = 50;
    if (p.city === job.city) s += 20;
    if (p.preferred_category === job.category) s += 20;
    if ((p.experience_years ?? 0) >= job.experience_required) s += 10;
    if (p.salary_expectation && p.salary_expectation <= job.salary_max) s += 0;
    return Math.min(100, s);
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopBar />
      <div className="mx-auto max-w-4xl px-4 py-5">
        <Link to="/employer/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold">{job?.title ?? "Applicants"}</h1>
        <p className="text-sm text-muted-foreground">{apps?.length ?? 0} candidate{(apps?.length ?? 0) !== 1 ? "s" : ""}</p>

        <div className="mt-5 space-y-3">
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          : apps && apps.length > 0 ? apps.map((a: any) => {
            const p = a.profiles;
            const match = computeMatch(p);
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{p?.name ?? "Worker"}</h3>
                      <Badge className="rounded-full border-0 bg-trust/10 text-trust">Match {match}%</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p?.experience_years ?? 0}y exp · {p?.city ?? "—"} · ₹{p?.salary_expectation ?? "—"}/mo expected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Looking for: {CATEGORIES.find(c => c.slug === p?.preferred_category)?.name ?? "Any"}
                      {p?.languages?.length ? ` · Speaks: ${p.languages.join(", ")}` : ""}
                    </p>
                  </div>
                  <Badge className="rounded-full border-0 bg-secondary text-secondary-foreground capitalize">{a.status}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/chat/$applicationId" params={{ applicationId: a.id }}>
                      <MessageCircle className="mr-1 h-3.5 w-3.5" />Chat
                      {unreadByApp[a.id] > 0 && (
                        <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                          {unreadByApp[a.id] > 9 ? "9+" : unreadByApp[a.id]}
                        </span>
                      )}
                    </Link>
                  </Button>
                  <Button size="sm" className="rounded-full bg-success hover:bg-success/90 text-success-foreground" onClick={() => setStatus.mutate({ id: a.id, status: "shortlisted" })}>
                    <Check className="mr-1 h-3.5 w-3.5" />Shortlist
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus.mutate({ id: a.id, status: "rejected" })}>
                    <X className="mr-1 h-3.5 w-3.5" />Reject
                  </Button>
                </div>
              </div>
            );
          }) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No applicants yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
