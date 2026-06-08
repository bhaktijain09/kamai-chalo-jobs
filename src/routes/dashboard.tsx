import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Briefcase, FileText, Bookmark, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";
import { JobCard } from "@/components/JobCard";

export const Route = createFileRoute("/dashboard")({
  component: WorkerDashboard,
});

function WorkerDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
    if (!loading && user && role === "employer") navigate({ to: "/employer/dashboard" });
  }, [user, role, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["recommended-jobs", profile?.city, profile?.preferred_category],
    queryFn: async () => {
      let q = supabase.from("jobs")
        .select("id,title,category,city,area,salary_min,salary_max,openings,urgent,created_at,employers(company_name,logo_url)")
        .eq("status", "live").order("created_at", { ascending: false }).limit(10);
      if (profile?.city) q = q.eq("city", profile.city);
      if (profile?.preferred_category) q = q.eq("category", profile.preferred_category);
      const { data } = await q;
      return data ?? [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["worker-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ count: appCount }, { count: savedCount }] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("worker_id", user!.id),
        supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("worker_id", user!.id),
      ]);
      return { applied: appCount ?? 0, saved: savedCount ?? 0 };
    },
  });

  // Profile completion
  const fields = profile ? ["name","city","preferred_category","experience_years","salary_expectation","languages"] : [];
  const filled = profile ? fields.filter((f) => {
    const v = (profile as any)[f];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length : 0;
  const completion = fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="mx-auto max-w-3xl px-4 py-5 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold">Hi {profile?.name?.split(" ")[0] ?? "there"} 👋</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {profile?.city ?? "Set your city"}
          </p>
        </div>

        {completion < 100 && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Profile {completion}% complete</p>
              <Button asChild size="sm" variant="ghost"><Link to="/profile">Complete</Link></Button>
            </div>
            <Progress value={completion} className="mt-2 h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={FileText} label="Applications" value={stats?.applied ?? 0} to="/applications" />
          <StatCard icon={Bookmark} label="Saved jobs" value={stats?.saved ?? 0} to="/saved" />
        </div>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Recommended for you</h2>
            <Button asChild size="sm" variant="ghost"><Link to="/jobs">See all <ChevronRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="mt-3 space-y-3">
            {jobsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : jobs && jobs.length > 0 ? (
              jobs.slice(0, 5).map((j) => <JobCard key={j.id} job={j as any} />)
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </div>
      <MobileNav />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; to: string }) {
  return (
    <Link to={to as any} className="rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/30">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">No jobs yet — try browsing all jobs.</p>
      <Button asChild className="mt-3 rounded-full"><Link to="/jobs">Browse all</Link></Button>
    </div>
  );
}
