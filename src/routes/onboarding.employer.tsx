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
import { TopBar } from "@/components/TopBar";
import { CITIES } from "@/lib/format";

const schema = z.object({
  company_name: z.string().trim().min(2).max(120),
  industry: z.string().max(120).optional(),
  city: z.string().min(1),
  contact_person: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/, "Enter a valid phone"),
  gst: z.string().max(20).optional(),
});
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/onboarding/employer")({
  component: EmployerOnboarding,
});

function EmployerOnboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("employers").insert({
      user_id: user.id,
      company_name: data.company_name,
      industry: data.industry || null,
      city: data.city,
      contact_person: data.contact_person,
      phone: data.phone,
      gst: data.gst || null,
      email: user.email,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Company registered!");
    navigate({ to: "/employer/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="text-2xl font-extrabold">Tell us about your company</h1>
        <p className="text-sm text-muted-foreground">Start hiring in minutes.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="company_name">Company name *</Label>
            <Input id="company_name" className="h-12 rounded-xl" {...register("company_name")} />
            {errors.company_name && <p className="mt-1 text-xs text-destructive">{errors.company_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" placeholder="e.g. Logistics, Restaurant" className="h-12 rounded-xl" {...register("industry")} />
          </div>
          <div>
            <Label htmlFor="city">Hiring city *</Label>
            <select id="city" className="h-12 w-full rounded-xl border border-input bg-background px-3" {...register("city")}>
              <option value="">Choose city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
          </div>
          <div>
            <Label htmlFor="contact_person">Contact person *</Label>
            <Input id="contact_person" className="h-12 rounded-xl" {...register("contact_person")} />
            {errors.contact_person && <p className="mt-1 text-xs text-destructive">{errors.contact_person.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Mobile *</Label>
            <Input id="phone" type="tel" placeholder="+91…" className="h-12 rounded-xl" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="gst">GST (optional)</Label>
            <Input id="gst" className="h-12 rounded-xl" {...register("gst")} />
          </div>
          <Button type="submit" disabled={saving} className="h-12 w-full rounded-full font-bold shadow-elevated">
            {saving ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
