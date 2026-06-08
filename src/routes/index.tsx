import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Search, Users, Star, Shield, Clock, MapPin, ArrowRight, Bike, Car, ChefHat, Sparkles, Phone, Wrench, Zap, Package, HandHelping, Keyboard, Scissors, Shirt, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/TopBar";
import { CITIES, CATEGORIES } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: Landing,
});

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Bike, Car, Shield, Sparkles, ChefHat, Briefcase, Phone, TrendingUp, Package, HandHelping, Zap, Wrench, Scissors, Shirt, Keyboard,
};

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-trust" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-white/40" />
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="max-w-2xl text-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-current" /> India's fastest hiring app
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Find Jobs Near You <span className="text-primary">Fast</span>
            </h1>
            <p className="mt-3 text-lg text-foreground/80 md:text-xl">
              Hire or get hired in minutes. No paperwork. No waiting.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-full bg-primary px-8 text-base font-bold shadow-elevated hover:bg-primary/90">
                <Link to="/signup" search={{ role: "worker" }}>
                  <Search className="mr-2 h-5 w-5" /> I Need a Job
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-foreground/30 bg-background/60 px-8 text-base font-bold text-foreground backdrop-blur hover:bg-background/80">
                <Link to="/signup" search={{ role: "employer" }}>
                  <Users className="mr-2 h-5 w-5" /> I Want to Hire
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/80">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Verified employers</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Apply in 30 seconds</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> 8+ cities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Popular Job Categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick what you do best</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/jobs">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map((c) => {
            const Icon = ICON_MAP[c.icon] ?? Briefcase;
            return (
              <Link
                key={c.slug}
                to="/jobs"
                search={{ category: c.slug }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cities */}
      <section className="bg-muted/40 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl">Jobs in your city</h2>
          <p className="mt-1 text-sm text-muted-foreground">Find work near home</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CITIES.map((city) => (
              <Link
                key={city}
                to="/jobs"
                search={{ city }}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-soft transition hover:border-primary/40 hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-trust" /> {city}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: 1, t: "Sign up free", d: "Create your profile in 2 minutes — no fees, ever." },
            { n: 2, t: "Browse or post", d: "Workers find nearby jobs. Employers post in 1 minute." },
            { n: 3, t: "Apply or hire", d: "Quick apply, instant chat. Get hired the same day." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground">{s.n}</div>
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-foreground py-12 text-background">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4">
          {[
            { v: "5L+", l: "Workers" },
            { v: "20k+", l: "Employers" },
            { v: "1L+", l: "Jobs Posted" },
            { v: "8", l: "Cities" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl font-extrabold text-primary md:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-background/60">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">Loved by workers and employers</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "Ramesh K.", r: "Delivery Boy, Mumbai", q: "Got my Zomato job in 2 days. Best app for jobs!" },
            { n: "Priya S.", r: "Employer, Delhi", q: "Hired 5 helpers in one week. Super easy to use." },
            { n: "Suresh P.", r: "Driver, Bangalore", q: "Free hai aur paas mein kaam milta hai. Recommended!" },
          ].map((t) => (
            <div key={t.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-3 text-sm text-foreground/90">"{t.q}"</p>
              <div className="mt-4">
                <div className="text-sm font-semibold">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-foreground">BlueCollar</span>
          </div>
          <p className="mt-2">India's blue-collar job marketplace</p>
          <p className="mt-1 text-xs">© {new Date().getFullYear()} BlueCollar. Made with ❤️ in India.</p>
        </div>
      </footer>
    </div>
  );
}
