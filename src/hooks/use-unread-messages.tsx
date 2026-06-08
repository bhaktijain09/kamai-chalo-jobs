import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type AppRow = {
  id: string;
  worker_id: string;
  job_id: string;
  worker_last_read_at: string;
  employer_last_read_at: string;
  employer_user_id: string | null;
};

type UnreadCtx = {
  unreadByApp: Record<string, number>;
  totalUnread: number;
  markRead: (applicationId: string) => Promise<void>;
};

const Ctx = createContext<UnreadCtx>({ unreadByApp: {}, totalUnread: 0, markRead: async () => {} });

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [unreadByApp, setUnreadByApp] = useState<Record<string, number>>({});
  const appsRef = useRef<AppRow[]>([]);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  // Load apps the user participates in + initial unread counts
  const loadAll = async () => {
    if (!user) {
      setUnreadByApp({});
      appsRef.current = [];
      return;
    }
    // Apps where user is worker
    const { data: workerApps } = await supabase
      .from("applications")
      .select("id,worker_id,job_id,worker_last_read_at,employer_last_read_at")
      .eq("worker_id", user.id);

    // Apps where user is employer (via jobs.employer_id -> employers.user_id)
    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let employerApps: any[] = [];
    if (employer?.id) {
      const { data: jobs } = await supabase.from("jobs").select("id").eq("employer_id", employer.id);
      const jobIds = (jobs ?? []).map((j) => j.id);
      if (jobIds.length) {
        const { data } = await supabase
          .from("applications")
          .select("id,worker_id,job_id,worker_last_read_at,employer_last_read_at")
          .in("job_id", jobIds);
        employerApps = data ?? [];
      }
    }

    const all: AppRow[] = [
      ...(workerApps ?? []).map((a) => ({ ...a, employer_user_id: null })),
      ...employerApps.map((a) => ({ ...a, employer_user_id: user.id })),
    ];
    appsRef.current = all;

    // Compute unread counts per app
    const counts: Record<string, number> = {};
    await Promise.all(
      all.map(async (a) => {
        const isWorker = a.worker_id === user.id;
        const since = isWorker ? a.worker_last_read_at : a.employer_last_read_at;
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("application_id", a.id)
          .neq("sender_id", user.id)
          .gt("created_at", since);
        if (count && count > 0) counts[a.id] = count;
      }),
    );
    setUnreadByApp(counts);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Subscribe to new messages globally
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`global-messages:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as { id: string; application_id: string; sender_id: string; body: string };
          if (m.sender_id === user.id) return;
          const app = appsRef.current.find((a) => a.id === m.application_id);
          if (!app) {
            // New conversation we don't know about — refetch
            loadAll();
            return;
          }
          // If user is currently viewing this chat, auto-mark read
          if (pathRef.current === `/chat/${m.application_id}`) {
            supabase.rpc("mark_application_read", { _application_id: m.application_id });
            return;
          }
          setUnreadByApp((prev) => ({ ...prev, [m.application_id]: (prev[m.application_id] ?? 0) + 1 }));
          toast("New message", {
            description: m.body.length > 80 ? m.body.slice(0, 80) + "…" : m.body,
            action: {
              label: "Open",
              onClick: () => navigate({ to: "/chat/$applicationId", params: { applicationId: m.application_id } }),
            },
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markRead = async (applicationId: string) => {
    if (!user) return;
    await supabase.rpc("mark_application_read", { _application_id: applicationId });
    setUnreadByApp((prev) => {
      if (!prev[applicationId]) return prev;
      const next = { ...prev };
      delete next[applicationId];
      return next;
    });
    // Update local cached read timestamp
    appsRef.current = appsRef.current.map((a) => {
      if (a.id !== applicationId) return a;
      const now = new Date().toISOString();
      return a.worker_id === user.id
        ? { ...a, worker_last_read_at: now }
        : { ...a, employer_last_read_at: now };
    });
  };

  const totalUnread = useMemo(
    () => Object.values(unreadByApp).reduce((s, n) => s + n, 0),
    [unreadByApp],
  );

  return <Ctx.Provider value={{ unreadByApp, totalUnread, markRead }}>{children}</Ctx.Provider>;
}

export function useUnreadMessages() {
  return useContext(Ctx);
}
