-- Messages table for application-scoped chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_application ON public.messages(application_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a participant on this application?
CREATE OR REPLACE FUNCTION public.is_application_participant(_application_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.applications a
    LEFT JOIN public.jobs j ON j.id = a.job_id
    LEFT JOIN public.employers e ON e.id = j.employer_id
    WHERE a.id = _application_id
      AND (a.worker_id = _user_id OR e.user_id = _user_id)
  );
$$;

CREATE POLICY "Participants read messages"
ON public.messages FOR SELECT
USING (public.is_application_participant(application_id, auth.uid()));

CREATE POLICY "Participants send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND public.is_application_participant(application_id, auth.uid())
);

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;