import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { JobCard } from "@/components/JobCard";
import { CATEGORIES, CITIES } from "@/lib/format";

const searchSchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  urgent: z.coerce.boolean().optional(),
});

export const Route = createFileRoute("/jobs/")({
  validateSearch: searchSchema,
  component: JobsPage,
});

function JobsPage() {
  const params = Route.useSearch();
  const navigate = Route.useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState(params.q ?? "");

  useEffect(() => { setQ(params.q ?? ""); }, [params.q]);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select("id,title,category,city,area,salary_min,salary_max,openings,urgent,created_at,employers(company_name,logo_url)")
        .eq("status", "live")
        .order("urgent", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (params.city) query = query.eq("city", params.city);
      if (params.category) query = query.eq("category", params.category);
      if (params.urgent) query = query.eq("urgent", true);
      if (params.q) query = query.ilike("title", `%${params.q}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateSearch = (patch: Record<string, string | boolean | undefined>) => {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
  };

  const clearAll = () => navigate({ search: {} });

  const activeFilters = [params.city, params.category, params.urgent && "Urgent"].filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-extrabold md:text-3xl">Browse jobs</h1>

        {/* Search */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateSearch({ q: q || undefined })}
              placeholder="Search job title..."
              className="h-12 rounded-full pl-10"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-full" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-3 shadow-soft">
            <select className="h-11 rounded-xl border border-input bg-background px-3 text-sm" value={params.city ?? ""} onChange={(e) => updateSearch({ city: e.target.value || undefined })}>
              <option value="">All cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="h-11 rounded-xl border border-input bg-background px-3 text-sm" value={params.category ?? ""} onChange={(e) => updateSearch({ category: e.target.value || undefined })}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <label className="col-span-2 flex items-center gap-2 px-1 text-sm">
              <input type="checkbox" checked={!!params.urgent} onChange={(e) => updateSearch({ urgent: e.target.checked || undefined })} />
              Show only urgent hiring
            </label>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeFilters.map((f) => (
              <Badge key={String(f)} variant="secondary" className="rounded-full">{String(f)}</Badge>
            ))}
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}

        {/* Results */}
        <div className="mt-5 space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : jobs && jobs.length > 0 ? (
            jobs.map((j) => <JobCard key={j.id} job={j as any} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No jobs match your filters.</p>
              <Button asChild variant="outline" className="mt-4 rounded-full"><Link to="/jobs">See all jobs</Link></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
