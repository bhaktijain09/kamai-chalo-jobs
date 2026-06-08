import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { toast } from "sonner";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

export const Route = createFileRoute("/chat/$applicationId")({
  component: ChatPage,
});

type Message = {
  id: string;
  application_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function ChatPage() {
  const { applicationId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { markRead } = useUnreadMessages();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  // Load application context (job + worker) so we can show a header
  const { data: app } = useQuery({
    queryKey: ["chat-app", applicationId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id,worker_id,job_id")
        .eq("id", applicationId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const [{ data: worker }, { data: job }] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", data.worker_id).maybeSingle(),
        supabase.from("jobs").select("title,employers(company_name,user_id)").eq("id", data.job_id).maybeSingle(),
      ]);
      return { ...data, worker, job };
    },
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", applicationId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages:${applicationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `application_id=eq.${applicationId}` },
        (payload) => {
          qc.setQueryData<Message[]>(["messages", applicationId], (prev) => {
            const next = payload.new as Message;
            if (!prev) return [next];
            if (prev.some((m) => m.id === next.id)) return prev;
            return [...prev, next];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId, user, qc]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);

  // Mark conversation as read whenever messages change or chat opens
  useEffect(() => {
    if (user) markRead(applicationId);
  }, [user, applicationId, messages?.length, markRead]);

  const send = async () => {
    const body = text.trim();
    if (!body || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      application_id: applicationId,
      sender_id: user.id,
      body,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
  };

  const otherName =
    app?.job?.employers?.user_id === user?.id
      ? app?.worker?.name ?? "Worker"
      : app?.job?.employers?.company_name ?? "Employer";

  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar />
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button onClick={() => history.back()} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{otherName}</div>
            <div className="truncate text-xs text-muted-foreground">
              {app?.job?.title ?? "Conversation"}
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-2/3 rounded-2xl" />)
          ) : messages && messages.length > 0 ? (
            messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
                      mine
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-card border border-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <div className={`mt-0.5 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No messages yet. Say hello 👋
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/95 p-3 backdrop-blur">
        <form
          className="mx-auto flex max-w-2xl items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            className="h-12 rounded-full"
          />
          <Button type="submit" size="lg" disabled={!text.trim() || sending} className="h-12 rounded-full px-5">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] text-muted-foreground">
          <Link to="/applications" className="hover:underline">View all conversations</Link>
        </p>
      </div>
    </div>
  );
}
