ALTER TABLE public.applications
  ADD CONSTRAINT applications_worker_id_profiles_fkey
  FOREIGN KEY (worker_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;