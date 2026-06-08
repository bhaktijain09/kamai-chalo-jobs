import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopBar } from "@/components/TopBar";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Determine where to send them
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").limit(1).maybeSingle();
    toast.success("Welcome back!");
    if (roleRow?.role === "employer") navigate({ to: "/employer/dashboard" });
    else if (roleRow?.role === "worker") navigate({ to: "/dashboard" });
    else navigate({ to: "/signup", search: { role: "worker" } });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar showAuth={false} />
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Login to find or post jobs.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" className="h-12 rounded-xl" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" className="h-12 rounded-xl" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-bold shadow-elevated">
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-trust hover:underline">Forgot password?</Link>
          <Link to="/signup" search={{ role: "worker" }} className="font-semibold text-primary hover:underline">
            New here? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
