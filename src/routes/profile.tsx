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
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";
import { CATEGORIES, CITIES } from "@/lib/format";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  age: z.coerce.number().min(16).max(80),
  city: z.string().min(1),
  preferred_category: z.string().min(1),
  experience_years: z.coerce.number().min(0).max(50),
  salary_expectation: z.coerce.number().min(1000).max(500000),
  languages: z.string().max(200).optional(),
  phone: z.string().trim().optional().or(z.literal("")),
});

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile-edit", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        age: profile.age ?? 18,
        city: profile.city ?? "",
        preferred_category: profile.preferred_category ?? "",
        experience_years: profile.experience_years ?? 0,
        salary_expectation: profile.salary_expectation ?? 15000,
        languages: profile.languages?.join(", ") ?? "",
        phone: profile.phone ?? "",
      } as any);
    }
  }, [profile, reset]);

  const onSubmit = async (data: z.output<typeof schema>) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: data.name,
      age: data.age,
      city: data.city,
      preferred_category: data.preferred_category,
      experience_years: data.experience_years,
      salary_expectation: data.salary_expectation,
      languages: data.languages ? data.languages.split(",").map((s) => s.trim()).filter(Boolean) : null,
      phone: data.phone || null,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <div className="mx-auto max-w-md px-4 py-5">
        <h1 className="text-2xl font-extrabold">My profile</h1>
        <p className="text-sm text-muted-foreground">Keep this updated for better matches.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <Field label="Full name" error={errors.name?.message}><Input className="h-12 rounded-xl" {...register("name")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" error={errors.age?.message}><Input type="number" className="h-12 rounded-xl" {...register("age")} /></Field>
            <Field label="Phone"><Input type="tel" className="h-12 rounded-xl" {...register("phone")} /></Field>
          </div>
          <Field label="City" error={errors.city?.message}>
            <select className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("city")}>
              <option value="">Choose city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Preferred work" error={errors.preferred_category?.message}>
            <select className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("preferred_category")}>
              <option value="">Choose category</option>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Experience (yrs)"><Input type="number" className="h-12 rounded-xl" {...register("experience_years")} /></Field>
            <Field label="Expected ₹/mo"><Input type="number" className="h-12 rounded-xl" {...register("salary_expectation")} /></Field>
          </div>
          <Field label="Languages"><Input placeholder="Hindi, English" className="h-12 rounded-xl" {...register("languages")} /></Field>

          <Button type="submit" disabled={saving} className="h-12 w-full rounded-full font-bold shadow-elevated">
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button type="button" variant="outline" className="h-12 w-full rounded-full" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
            Logout
          </Button>
        </form>
      </div>
      <MobileNav />
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
