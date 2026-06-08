import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TopBar } from "@/components/TopBar";
import { CATEGORIES, CITIES } from "@/lib/format";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  age: z.coerce.number().min(16).max(80),
  gender: z.string().optional(),
  city: z.string().min(1, "Select a city"),
  preferred_category: z.string().min(1, "Select a category"),
  experience_years: z.coerce.number().min(0).max(50),
  salary_expectation: z.coerce.number().min(1000).max(500000),
  languages: z.string().max(200).optional(),
});
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/onboarding/worker")({
  component: WorkerOnboarding,
});

function WorkerOnboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const totalSteps = 3;

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.input<typeof schema>, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: { experience_years: 0 } as any,
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        age: data.age,
        gender: data.gender || null,
        city: data.city,
        preferred_category: data.preferred_category,
        experience_years: data.experience_years,
        salary_expectation: data.salary_expectation,
        languages: data.languages ? data.languages.split(",").map(s => s.trim()).filter(Boolean) : null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved!");
    navigate({ to: "/dashboard" });
  };

  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const watched = watch() as Partial<FormData>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="text-2xl font-extrabold">Build your profile</h1>
        <p className="text-sm text-muted-foreground">Takes 2 minutes. Saved automatically.</p>
        <Progress value={((step + 1) / totalSteps) * 100} className="mt-4 h-2" />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" className="h-12 rounded-xl" {...register("name")} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" type="number" className="h-12 rounded-xl" {...register("age")} />
                  {errors.age && <p className="mt-1 text-xs text-destructive">{errors.age.message}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("gender")}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <select id="city" className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("city")}>
                  <option value="">Choose city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <Label htmlFor="preferred_category">What kind of work? *</Label>
                <select id="preferred_category" className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("preferred_category")}>
                  <option value="">Choose category</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
                {errors.preferred_category && <p className="mt-1 text-xs text-destructive">{errors.preferred_category.message}</p>}
              </div>
              <div>
                <Label htmlFor="experience_years">Experience (years) *</Label>
                <Input id="experience_years" type="number" min={0} className="h-12 rounded-xl" {...register("experience_years")} />
              </div>
              <div>
                <Label htmlFor="languages">Languages (comma separated)</Label>
                <Input id="languages" placeholder="Hindi, English, Marathi" className="h-12 rounded-xl" {...register("languages")} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="salary_expectation">Expected monthly salary (₹) *</Label>
                <Input id="salary_expectation" type="number" min={1000} placeholder="e.g. 18000" className="h-12 rounded-xl" {...register("salary_expectation")} />
                {errors.salary_expectation && <p className="mt-1 text-xs text-destructive">{errors.salary_expectation.message}</p>}
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-sm">
                <p className="font-semibold">Almost done!</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>👤 {watched.name || "—"}, {watched.age || "?"}, {watched.city || "?"}</li>
                  <li>💼 {CATEGORIES.find(c => c.slug === watched.preferred_category)?.name || "—"} · {watched.experience_years || 0}y exp</li>
                  <li>💰 ₹{watched.salary_expectation || "—"}/month expected</li>
                </ul>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <Button type="button" variant="outline" className="h-12 flex-1 rounded-full" onClick={back}>Back</Button>
            )}
            {step < totalSteps - 1 ? (
              <Button type="button" className="h-12 flex-1 rounded-full font-bold" onClick={next}>Next</Button>
            ) : (
              <Button type="submit" disabled={saving} className="h-12 flex-1 rounded-full font-bold">
                {saving ? "Saving..." : "Finish"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
