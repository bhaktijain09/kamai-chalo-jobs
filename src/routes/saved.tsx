import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";
import { JobCard } from "@/components/JobCard";

export const Route = createFileRoute("/saved")({ component: SavedPage });

function SavedPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["saved-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_jobs")
        .select("jobs(id,title,category,city,area,salary_min,salary_max,openings,urgent,created_at,employers(company_name,logo_url))")
        .eq("worker_id", user!.id);
      return (data ?? []).map((d: any) => d.jobs).filter(Boolean);
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="mx-auto max-w-3xl px-4 py-5">
        <h1 className="text-2xl font-extrabold">Saved jobs</h1>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : data && data.length > 0 ? (
            data.map((j: any) => <JobCard key={j.id} job={j} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
              <Button asChild className="mt-4 rounded-full"><Link to="/jobs">Browse jobs</Link></Button>
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
