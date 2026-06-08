import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { MapPin, Clock, Users, Zap, IndianRupee, Briefcase, Bookmark, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { formatSalary, timeAgo, CATEGORIES } from "@/lib/format";

export const Route = createFileRoute("/jobs/$jobId")({
  component: JobDetails,
});

function JobDetails() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, employers(id,company_name,logo_url,city,verified)")
        .eq("id", jobId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: application } = useQuery({
    queryKey: ["application", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications").select("id").eq("job_id", jobId).eq("worker_id", user!.id).maybeSingle();
      return data;
    },
  });
  const applied = !!application;

  const { data: saved } = useQuery({
    queryKey: ["saved", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_jobs").select("id").eq("job_id", jobId).eq("worker_id", user!.id).maybeSingle();
      return !!data;
    },
  });

  const apply = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      const { error } = await supabase.from("applications").insert({ job_id: jobId, worker_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Applied! Employer will contact you.");
      qc.invalidateQueries({ queryKey: ["application", jobId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      if (saved) {
        await supabase.from("saved_jobs").delete().eq("job_id", jobId).eq("worker_id", user.id);
      } else {
        await supabase.from("saved_jobs").insert({ job_id: jobId, worker_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved", jobId] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p>Job not found.</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/jobs">Browse jobs</Link></Button>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (!user) { navigate({ to: "/signup", search: { role: "worker" } }); return; }
    if (role !== "worker") { toast.info("Only workers can apply"); return; }
    apply.mutate();
  };

  const categoryName = CATEGORIES.find(c => c.slug === job.category)?.name ?? job.category;

  return (
    <div className="min-h-screen bg-background pb-32">
      <TopBar />
      <div className="mx-auto max-w-3xl px-4 py-4">
        <button onClick={() => history.back()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-accent-foreground">
              {job.employers?.logo_url ? (
                <img src={job.employers.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                (job.employers?.company_name?.[0] ?? "C").toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold leading-tight">{job.title}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {job.employers?.company_name}
                {job.employers?.verified && <span className="ml-1 text-trust">✓</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="rounded-full text-xs">{categoryName}</Badge>
                {job.urgent && <Badge className="gap-1 rounded-full border-0 bg-destructive/10 text-destructive"><Zap className="h-3 w-3" />Urgent</Badge>}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat icon={IndianRupee} label="Salary" value={formatSalary(job.salary_min, job.salary_max)} />
            <Stat icon={MapPin} label="Location" value={`${job.area ? job.area + ", " : ""}${job.city}`} />
            <Stat icon={Users} label="Openings" value={String(job.openings)} />
            <Stat icon={Briefcase} label="Experience" value={`${job.experience_required}+ yrs`} />
            <Stat icon={Clock} label="Shift" value={String(job.shift_type).replace("_", " ")} />
            <Stat icon={Clock} label="Posted" value={timeAgo(job.created_at)} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold">Job description</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{job.description}</p>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur shadow-elevated">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full"
            onClick={() => user ? toggleSave.mutate() : navigate({ to: "/login" })}
          >
            <Bookmark className={saved ? "fill-primary text-primary" : ""} />
          </Button>
          <Button
            size="lg"
            disabled={applied || apply.isPending}
            className="h-12 flex-1 rounded-full text-base font-bold shadow-elevated"
            onClick={handleApply}
          >
            {applied ? "✓ Applied" : apply.isPending ? "Applying..." : "Quick Apply"}
          </Button>
          {applied && application && (
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full">
              <Link to="/chat/$applicationId" params={{ applicationId: application.id }} aria-label="Chat">
                <MessageCircle />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 font-semibold capitalize">{value}</div>
    </div>
  );
}
