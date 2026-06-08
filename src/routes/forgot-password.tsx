import { createFileRoute, Link } from "@tanstack/react-router";
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

const schema = z.object({ email: z.string().trim().email().max(255) });
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
});

function ForgotPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Check your email for the reset link"); setSent(true); }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar showAuth={false} />
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-3xl font-extrabold">Reset password</h1>
        <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
            <p className="text-sm">If an account exists for that email, a reset link is on its way.</p>
            <Button asChild className="mt-4 rounded-full"><Link to="/login">Back to login</Link></Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="h-12 rounded-xl" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="h-12 w-full rounded-full font-bold">
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
