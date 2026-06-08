import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TopBar } from "@/components/TopBar";
import { CATEGORIES, CITIES } from "@/lib/format";

const TEMPLATES: Record<string, { title: string; description: string }> = {
  delivery: { title: "Delivery Boy", description: "Deliver food/parcels in assigned area. Two-wheeler with valid license required. Petrol allowance + incentives." },
  driver: { title: "Driver", description: "Drive company vehicle for daily operations. Valid LMV/HMV license required. 8-hour shift." },
  cook: { title: "Cook", description: "Prepare daily meals (Indian/Chinese). Maintain kitchen hygiene. Min 1 year experience." },
  helper: { title: "Helper", description: "Assist with general tasks. No prior experience needed. Training provided." },
  sales: { title: "Sales Executive", description: "Field sales of products/services. Good communication required. Fixed + incentives." },
};

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.string().min(1),
  description: z.string().trim().min(20).max(2000),
  city: z.string().min(1),
  area: z.string().max(120).optional(),
  salary_min: z.coerce.number().min(1000),
  salary_max: z.coerce.number().min(1000),
  experience_required: z.coerce.number().min(0).max(30),
  openings: z.coerce.number().min(1).max(500),
  shift_type: z.enum(["day","night","flexible","full_time","part_time"]),
  urgent: z.boolean().default(false),
}).refine((d) => d.salary_max >= d.salary_min, { message: "Max salary must be ≥ min", path: ["salary_max"] });

export const Route = createFileRoute("/employer/jobs/new")({ component: NewJobPage });

function NewJobPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const { data: employer } = useQuery({
    queryKey: ["my-employer-new", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("employers").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { shift_type: "day", urgent: false, openings: 1, experience_required: 0 } as any,
  });

  const urgent = watch("urgent");

  const applyTemplate = (slug: string) => {
    const t = TEMPLATES[slug];
    if (!t) return;
    setValue("title", t.title);
    setValue("description", t.description);
    setValue("category", slug);
  };

  const onSubmit = async (data: z.output<typeof schema>) => {
    if (!employer) { toast.error("Complete company setup first"); return; }
    setSaving(true);
    const { error } = await supabase.from("jobs").insert({
      employer_id: employer.id,
      title: data.title,
      category: data.category,
      description: data.description,
      city: data.city,
      area: data.area || null,
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      experience_required: data.experience_required,
      openings: data.openings,
      shift_type: data.shift_type,
      urgent: data.urgent,
      status: "live",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Job posted!");
    navigate({ to: "/employer/jobs" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="mx-auto max-w-2xl px-4 py-5">
        <h1 className="text-2xl font-extrabold">Post a job</h1>
        <p className="text-sm text-muted-foreground">Reaches workers in your city instantly.</p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Quick templates</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(TEMPLATES).map((k) => (
              <button key={k} type="button" onClick={() => applyTemplate(k)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">
                {TEMPLATES[k].title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Field label="Job title" error={errors.title?.message}><Input className="h-12 rounded-xl" {...register("title")} /></Field>
          <Field label="Category" error={errors.category?.message}>
            <select className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("category")}>
              <option value="">Choose</option>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" error={errors.city?.message}>
              <select className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("city")}>
                <option value="">Choose</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Area"><Input placeholder="e.g. Andheri" className="h-12 rounded-xl" {...register("area")} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min salary ₹/mo" error={errors.salary_min?.message}><Input type="number" className="h-12 rounded-xl" {...register("salary_min")} /></Field>
            <Field label="Max salary ₹/mo" error={errors.salary_max?.message}><Input type="number" className="h-12 rounded-xl" {...register("salary_max")} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Experience (yrs)"><Input type="number" min={0} className="h-12 rounded-xl" {...register("experience_required")} /></Field>
            <Field label="Openings"><Input type="number" min={1} className="h-12 rounded-xl" {...register("openings")} /></Field>
            <Field label="Shift">
              <select className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("shift_type")}>
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="flexible">Flexible</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
              </select>
            </Field>
          </div>
          <Field label="Job description" error={errors.description?.message}>
            <Textarea rows={5} className="rounded-xl" {...register("description")} />
          </Field>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div>
              <Label className="text-sm font-semibold">Urgent hiring</Label>
              <p className="text-xs text-muted-foreground">Highlights your job to attract more applicants.</p>
            </div>
            <Switch checked={urgent} onCheckedChange={(v) => setValue("urgent", v)} />
          </div>

          <Button type="submit" disabled={saving} className="h-12 w-full rounded-full font-bold shadow-elevated">
            {saving ? "Posting..." : "Post job"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
