ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS worker_last_read_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS employer_last_read_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.mark_application_read(_application_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  is_worker boolean;
  is_employer boolean;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT (a.worker_id = uid),
         EXISTS (SELECT 1 FROM jobs j JOIN employers e ON e.id = j.employer_id
                 WHERE j.id = a.job_id AND e.user_id = uid)
    INTO is_worker, is_employer
  FROM applications a WHERE a.id = _application_id;

  IF is_worker THEN
    UPDATE applications SET worker_last_read_at = now() WHERE id = _application_id;
  END IF;
  IF is_employer THEN
    UPDATE applications SET employer_last_read_at = now() WHERE id = _application_id;
  END IF;
END;
$$;

-- Allow participants to update their own last-read column via the function above.
-- Also add an UPDATE policy for workers so the row update succeeds when called as worker.
DROP POLICY IF EXISTS "Workers update own application read" ON public.applications;
CREATE POLICY "Workers update own application read"
ON public.applications
FOR UPDATE
USING (auth.uid() = worker_id)
WITH CHECK (auth.uid() = worker_id);
