import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopBar } from "@/components/TopBar";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});
type FormData = z.infer<typeof schema>;

const searchSchema = z.object({
  role: z.enum(["worker", "employer"]).catch("worker"),
});

export const Route = createFileRoute("/signup")({
  validateSearch: searchSchema,
  component: SignupPage,
});

function SignupPage() {
  const { role: initialRole } = Route.useSearch();
  const navigate = useNavigate();
  const [role, setRole] = useState<"worker" | "employer">(initialRole);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name: data.name },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    const userId = signUpData.user?.id;
    if (userId) {
      await supabase.from("user_roles").insert({ user_id: userId, role });
    }
    setLoading(false);
    toast.success("Account created!");
    if (role === "employer") navigate({ to: "/onboarding/employer" });
    else navigate({ to: "/onboarding/worker" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar showAuth={false} />
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Free forever. No credit card needed.</p>

        {/* Role chooser */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("worker")}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition",
              role === "worker" ? "border-primary bg-accent shadow-elevated" : "border-border bg-card"
            )}
          >
            <Search className={cn("h-6 w-6", role === "worker" ? "text-primary" : "text-muted-foreground")} />
            <div className="mt-2 font-bold">I need a job</div>
            <div className="text-xs text-muted-foreground">Find work near you</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("employer")}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition",
              role === "employer" ? "border-primary bg-accent shadow-elevated" : "border-border bg-card"
            )}
          >
            <Users className={cn("h-6 w-6", role === "employer" ? "text-primary" : "text-muted-foreground")} />
            <div className="mt-2 font-bold">I want to hire</div>
            <div className="text-xs text-muted-foreground">Post jobs free</div>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" className="h-12 rounded-xl" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" className="h-12 rounded-xl" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" className="h-12 rounded-xl" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-bold shadow-elevated">
            {loading ? "Creating account..." : `Create ${role === "worker" ? "worker" : "employer"} account`}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
