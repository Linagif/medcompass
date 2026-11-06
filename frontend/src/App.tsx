import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar, { type BackendStatus } from "./components/Sidebar";
import TopBar from "./components/TopBar";
import HomeView from "./components/HomeView";
import ConversationView from "./components/ConversationView";
import { DEFAULT_DEPARTMENT_ID, getDepartment } from "./config/departments";
import { ApiError, fetchHealth, sendChat } from "./services/api";
import type { ChatMessage, HistoryTurn } from "./types";

const MAX_HISTORY_TURNS = 6; // keep requests small; backend accepts up to 8
const MAX_HISTORY_CHARS = 6000;

let idCounter = 0;
const newId = () => `m${Date.now()}-${idCounter++}`;

/** Earlier turns sent for context. Demo/safety replies are skipped: they are not real answers. */
function toHistory(messages: ChatMessage[]): HistoryTurn[] {
  return messages
    .filter((m) => m.role === "user" || m.mode === "ai")
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) }));
}

export default function App() {
  const [departmentId, setDepartmentId] = useState(DEFAULT_DEPARTMENT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<BackendStatus>({ state: "checking" });

  // Used to ignore a reply that arrives after the user started a new exploration.
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const department = getDepartment(departmentId);
  const inConversation = messages.length > 0;

  // Backend / provider status for the sidebar (never contains secrets).
  useEffect(() => {
    const ctrl = new AbortController();
    fetchHealth(ctrl.signal)
      .then((info) => setStatus({ state: "online", info }))
      .catch((err) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) setStatus({ state: "offline" });
      });
    return () => ctrl.abort();
  }, []);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const run = useCallback(
    async (text: string, history: HistoryTurn[]) => {
      const seq = ++requestSeq.current;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setError(null);
      setLoading(true);
      try {
        const res = await sendChat(text, departmentId, history, ctrl.signal);
        if (seq !== requestSeq.current) return;
        setMessages((prev) => [...prev, { id: newId(), role: "assistant", content: res.answer, mode: res.mode }]);
        // Refresh status so the sidebar stays truthful if the server was restarted with new settings.
        fetchHealth().then((info) => setStatus({ state: "online", info })).catch(() => undefined);
      } catch (err) {
        if (seq !== requestSeq.current) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [departmentId],
  );

  const ask = useCallback(
    (text: string) => {
      if (loading) return;
      const history = toHistory(messages);
      setMessages((prev) => [...prev, { id: newId(), role: "user", content: text }]);
      void run(text, history);
    },
    [loading, messages, run],
  );

  const retry = useCallback(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user" || loading) return;
    void run(last.content, toHistory(messages.slice(0, -1)));
  }, [messages, loading, run]);

  const newExploration = useCallback(() => {
    requestSeq.current++;
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setLoading(false);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  const selectDepartment = useCallback((id: string) => {
    setDepartmentId(id);
    setMenuOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-navy-900 focus:shadow-lift">
        Skip to main content
      </a>
      <Sidebar selectedId={departmentId} onSelect={selectDepartment} onNew={newExploration} open={menuOpen} onClose={() => setMenuOpen(false)} status={status} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar department={department} onOpenMenu={() => setMenuOpen(true)} onNew={newExploration} menuOpen={menuOpen} />
        <main id="main" className="min-h-0 flex-1 overflow-y-auto" tabIndex={-1}>
          {inConversation ? (
            <ConversationView messages={messages} loading={loading} error={error} onAsk={ask} onRetry={retry} departmentName={department.name} />
          ) : (
            <HomeView department={department} onSelectDepartment={selectDepartment} onAsk={ask} loading={loading} />
          )}
        </main>
      </div>
    </div>
  );
}
