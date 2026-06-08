import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Plus, Pause, Play, Trash2, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { formatSalary, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/employer/jobs/")({ component: ManageJobsPage });

function ManageJobsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const { data: employer } = useQuery({
    queryKey: ["my-employer-mgmt", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("employers").select("id").eq("user_id", user!.id).maybeSingle()).data,
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs", employer?.id],
    enabled: !!employer,
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*, applications(count)")
        .eq("employer_id", employer!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "live" | "paused" }) => {
      const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-jobs"] }); toast.success("Updated"); },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-jobs"] }); toast.success("Deleted"); },
  });

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopBar />
      <div className="mx-auto max-w-4xl px-4 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">My jobs</h1>
          <Button asChild className="rounded-full shadow-elevated"><Link to="/employer/jobs/new"><Plus className="mr-1 h-4 w-4" />New</Link></Button>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : jobs && jobs.length > 0 ? jobs.map((j: any) => (
            <div key={j.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="line-clamp-1 font-semibold">{j.title}</h3>
                    <Badge className={`rounded-full border-0 ${j.status === "live" ? "bg-success/15 text-success" : j.status === "paused" ? "bg-warning/20 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                      {j.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{j.city} · {formatSalary(j.salary_min, j.salary_max)} · {timeAgo(j.created_at)}</p>
                </div>
                <Link to="/employer/jobs/$jobId/applicants" params={{ jobId: j.id }} className="text-xs font-semibold text-primary">
                  Applicants →
                </Link>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{j.applications?.[0]?.count ?? 0} applied</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{j.views} views</span>
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus.mutate({ id: j.id, status: j.status === "live" ? "paused" : "live" })}>
                    {j.status === "live" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this job?")) deleteJob.mutate(j.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
              <Button asChild className="mt-4 rounded-full"><Link to="/employer/jobs/new">Post your first job</Link></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
