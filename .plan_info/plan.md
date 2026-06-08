
# BlueCollar — Mobile-First Job Marketplace MVP

A two-sided job marketplace for blue-collar hiring in India, optimized for mobile and low digital literacy. Worker + Employer flows are in scope; admin, Hindi toggle, and dynamic SEO city pages are deferred.

## Brand & Design
- **Colors**: Orange (primary CTA, energy) + Blue (trust) + White, with subtle warm neutrals.
- **Mobile-first**: Big tap targets, bottom nav on mobile, sticky CTAs, rounded cards, clear iconography.
- **Empty states, skeletons, toasts, and loaders** everywhere.

## Auth
- **Email + Password** via Lovable Cloud (Supabase Auth).
- Signup → choose role (Job Seeker or Employer) → role-specific onboarding.
- Forgot password flow with `/reset-password` page.
- Roles stored in a separate `user_roles` table (worker / employer) with a `has_role` security definer function — never on profiles.

## Pages & Routes

**Public**
- `/` — Landing: hero, "I Need a Job" / "I Want to Hire" CTAs, category grid, city selector, how it works, stats, testimonials, FAQ, footer.
- `/login`, `/signup`, `/forgot-password`, `/reset-password`
- `/jobs` — Public browse with filters (city, category, salary, shift, experience, urgent).
- `/jobs/$jobId` — Job details with apply / save / company info.

**Worker (protected, role=worker)**
- `/onboarding/worker` — 2-min profile wizard with progress bar and autosave.
- `/dashboard` — Recommended, nearby, recent jobs; profile completion meter; application stats.
- `/applications` — Status timeline (Applied → Viewed → Shortlisted → Interview → Hired/Rejected).
- `/saved` — Saved jobs.
- `/profile` — Edit profile, salary, availability, documents.
- Bottom mobile nav: Home / Jobs / Applications / Saved / Profile.

**Employer (protected, role=employer)**
- `/onboarding/employer` — Company profile setup.
- `/employer/dashboard` — Metric cards (active jobs, applicants, shortlisted, hires) + Recharts trend, recent applicants, active jobs.
- `/employer/jobs/new` — Step-by-step post job wizard with category templates (Delivery, Driver, Cook, Helper, Sales).
- `/employer/jobs` — Manage jobs (Live/Closed/Draft, applicants, views, edit/pause/delete).
- `/employer/jobs/$jobId/applicants` — Candidate list with match score, call & WhatsApp buttons, shortlist/reject.

## Database (Lovable Cloud)
Tables with RLS:
- `profiles` (id, name, gender, age, city, category, experience, languages, salary_expectation, avatar_url, resume_url, verified)
- `user_roles` (user_id, role enum: worker/employer)
- `employers` (user_id, company_name, industry, logo_url, gst, city, contact_person, phone)
- `categories` (slug, name, icon) — seeded with 15 categories
- `cities` (slug, name, state) — seeded with 8 metros
- `jobs` (employer_id, title, category, description, city, area, salary_min/max, experience_required, openings, shift_type, urgent, status, created_at)
- `applications` (job_id, worker_id, status, applied_at) with status enum
- `saved_jobs` (worker_id, job_id)

**RLS**: Workers edit only own profile; employers manage only own jobs; employers see applicants only for their jobs; jobs publicly readable when status=live; saved/applications private to worker.

**Storage** buckets: `avatars`, `resumes`, `company-logos`.

**Seed data**: 15 categories with icons, 8 cities, ~30 realistic sample jobs across categories/cities, 1-2 demo employer accounts.

## Smart Features (v1)
- **Matching**: Score candidates/jobs by city + category + salary fit + experience fit (computed client-side from query).
- **Quick Apply**: One-tap apply from job card or details page.
- **WhatsApp deep links** on applicant rows (`https://wa.me/...`).
- **Verified badges** on profiles/employers.
- **Salary always shown as ₹/month** with min–max range.

## Tech
- TanStack Start (React + TS), Tailwind, shadcn/ui, Lucide icons.
- React Hook Form + Zod for all forms with validation.
- Recharts for employer dashboard.
- TanStack Query for data fetching/caching.
- Lovable Cloud for auth, DB, storage.

## Out of scope for v1 (placeholders ready)
Admin panel, Hindi/English toggle, dynamic per-city SEO pages, featured/boosted listings, subscriptions, resume DB unlock, pay-per-call leads — schema and UI hooks left extensible.
