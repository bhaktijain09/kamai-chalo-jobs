import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Users, Zap, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatSalary, timeAgo } from "@/lib/format";

export interface JobCardData {
  id: string;
  title: string;
  category: string;
  city: string;
  area: string | null;
  salary_min: number;
  salary_max: number;
  openings: number;
  urgent: boolean;
  created_at: string;
  employers?: { company_name: string; logo_url: string | null } | null;
}

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      to="/jobs/$jobId"
      params={{ jobId: job.id }}
      className="block rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-elevated hover:border-primary/30"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold">
          {job.employers?.logo_url ? (
            <img src={job.employers.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            (job.employers?.company_name?.[0] ?? job.title[0]).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-foreground">{job.title}</h3>
            {job.urgent && (
              <Badge className="shrink-0 gap-1 bg-destructive/10 text-destructive hover:bg-destructive/15 border-0">
                <Zap className="h-3 w-3" /> Urgent
              </Badge>
            )}
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {job.employers?.company_name ?? "Company"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-primary" />{formatSalary(job.salary_min, job.salary_max).replace("₹", "")}</span>
        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.area ? `${job.area}, ` : ""}{job.city}</span>
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{job.openings} opening{job.openings > 1 ? "s" : ""}</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{timeAgo(job.created_at)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-wide">{job.category}</Badge>
        <span className="text-xs font-semibold text-primary">Apply →</span>
      </div>
    </Link>
  );
}
