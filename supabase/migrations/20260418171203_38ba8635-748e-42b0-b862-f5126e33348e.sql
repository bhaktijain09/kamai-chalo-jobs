
-- ============= Enums =============
CREATE TYPE public.app_role AS ENUM ('worker', 'employer', 'admin');
CREATE TYPE public.application_status AS ENUM ('applied', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected');
CREATE TYPE public.job_status AS ENUM ('draft', 'live', 'paused', 'closed');
CREATE TYPE public.shift_type AS ENUM ('day', 'night', 'flexible', 'full_time', 'part_time');

-- ============= Helper: updated_at trigger =============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============= user_roles =============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own roles" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id AND role IN ('worker','employer'));

-- ============= categories =============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);

-- ============= cities =============
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  state TEXT NOT NULL
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities public read" ON public.cities FOR SELECT USING (true);

-- ============= profiles =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  gender TEXT,
  age INT,
  city TEXT,
  preferred_category TEXT,
  experience_years INT DEFAULT 0,
  languages TEXT[],
  salary_expectation INT,
  avatar_url TEXT,
  resume_url TEXT,
  aadhaar_last4 TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= employers =============
CREATE TABLE public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  logo_url TEXT,
  gst TEXT,
  city TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers public read" ON public.employers FOR SELECT USING (true);
CREATE POLICY "Users insert own employer" ON public.employers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own employer" ON public.employers FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER employers_updated_at BEFORE UPDATE ON public.employers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= jobs =============
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  salary_min INT NOT NULL,
  salary_max INT NOT NULL,
  experience_required INT NOT NULL DEFAULT 0,
  openings INT NOT NULL DEFAULT 1,
  shift_type public.shift_type NOT NULL DEFAULT 'day',
  gender_preference TEXT,
  urgent BOOLEAN NOT NULL DEFAULT false,
  status public.job_status NOT NULL DEFAULT 'live',
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobs_city ON public.jobs(city);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_status ON public.jobs(status);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Live jobs public read" ON public.jobs FOR SELECT USING (status = 'live' OR EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid()));
CREATE POLICY "Employers insert own jobs" ON public.jobs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid()));
CREATE POLICY "Employers update own jobs" ON public.jobs FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid()));
CREATE POLICY "Employers delete own jobs" ON public.jobs FOR DELETE USING (EXISTS (SELECT 1 FROM public.employers e WHERE e.id = employer_id AND e.user_id = auth.uid()));
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= applications =============
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'applied',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(job_id, worker_id)
);
CREATE INDEX idx_applications_worker ON public.applications(worker_id);
CREATE INDEX idx_applications_job ON public.applications(job_id);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workers view own applications" ON public.applications FOR SELECT USING (auth.uid() = worker_id OR EXISTS (SELECT 1 FROM public.jobs j JOIN public.employers e ON e.id = j.employer_id WHERE j.id = job_id AND e.user_id = auth.uid()));
CREATE POLICY "Workers insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Employers update applications on own jobs" ON public.applications FOR UPDATE USING (EXISTS (SELECT 1 FROM public.jobs j JOIN public.employers e ON e.id = j.employer_id WHERE j.id = job_id AND e.user_id = auth.uid()));
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= saved_jobs =============
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, job_id)
);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workers manage own saved jobs" ON public.saved_jobs FOR ALL USING (auth.uid() = worker_id) WITH CHECK (auth.uid() = worker_id);

-- ============= Storage buckets =============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('resumes', 'resumes', false),
  ('company-logos', 'company-logos', true);

CREATE POLICY "Avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Logos public read" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Users upload own logo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own logo" ON storage.objects FOR UPDATE USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own resume" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own resume" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own resume" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
