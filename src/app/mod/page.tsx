"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { timeAgo } from "@/lib/format";
import type { Question, QuestionStatus } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;

const TABS: { status: QuestionStatus; label: string }[] = [
  { status: "pending", label: "Review" },
  { status: "approved", label: "Approved" },
  { status: "rejected", label: "Rejected" },
];

export default function ModeratorPage() {
  const [auth, setAuth] = useState<"unknown" | "signed-out" | "signed-in">(
    "unknown"
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tab, setTab] = useState<QuestionStatus>("pending");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/mod/questions", { cache: "no-store" });
    if (res.status === 401) {
      setAuth("signed-out");
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    setAuth("signed-in");
    setQuestions(data.questions);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  async function setStatus(id: string, status: QuestionStatus) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    await fetch(`/api/mod/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  }

  if (auth === "unknown") return null;
  if (auth === "signed-out") return <SignIn onSignedIn={refresh} />;

  const visible = questions.filter((q) => q.status === tab);
  const counts = Object.fromEntries(
    TABS.map((t) => [t.status, questions.filter((q) => q.status === t.status).length])
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-4 text-sm">
        <a href="/" aria-label="Homepage">
          <Logo />
        </a>
        <a
          href="/"
          className="font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
        >
          Audience view
        </a>
      </header>

      <main className="flex-1 pb-24">
        <h1 className="pt-8 text-xl font-semibold">Moderation</h1>

        <nav className="mt-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.status}
              type="button"
              onClick={() => setTab(t.status)}
              className={`flex shrink-0 items-baseline gap-1.5 rounded-lg px-3 py-2 text-base font-medium whitespace-nowrap sm:py-1.5 sm:text-sm ${
                tab === t.status
                  ? "bg-neutral-950/5 text-neutral-950 dark:bg-white/10 dark:text-white"
                  : "text-neutral-600 hover:bg-neutral-950/2.5 dark:text-neutral-400 dark:hover:bg-white/5"
              }`}
            >
              {t.label}
              <span className="text-sm tabular-nums text-neutral-500 sm:text-xs dark:text-neutral-400">
                {counts[t.status]}
              </span>
            </button>
          ))}
        </nav>

        {visible.length === 0 ? (
          <p className="py-12 text-center text-base/7 text-neutral-500 sm:text-sm/6 dark:text-neutral-400">
            Nothing here right now.
          </p>
        ) : (
          <ul
            role="list"
            className="mt-4 divide-y divide-neutral-950/5 dark:divide-white/10"
          >
            {visible.map((q) => (
              <li key={q.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="min-w-0 flex-1 text-base/7 text-pretty sm:text-sm/6">
                    {q.body}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    {q.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => setStatus(q.id, "approved")}
                        className="rounded-md bg-emerald-500/10 px-2.5 py-2 text-base font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset hover:bg-emerald-500/15 sm:py-1 sm:text-sm dark:text-emerald-400 dark:ring-emerald-500/20"
                      >
                        Approve
                      </button>
                    )}
                    {q.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => setStatus(q.id, "rejected")}
                        className="rounded-md px-2.5 py-2 text-base font-medium text-neutral-600 ring-1 ring-neutral-950/10 ring-inset hover:bg-neutral-950/2.5 sm:py-1 sm:text-sm dark:text-neutral-400 dark:ring-white/10 dark:hover:bg-white/5"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {q.category && (
                    <span className="inline-flex items-center rounded-md bg-neutral-950/2.5 px-1.5 py-0.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-950/10 ring-inset dark:bg-white/5 dark:text-neutral-400 dark:ring-white/10">
                      {q.category}
                    </span>
                  )}
                  {q.author_name ?? "Anonymous"} · {timeAgo(q.created_at)} ·{" "}
                  <span className="tabular-nums">{q.votes} votes</span>
                  {q.moderation_reason && ` · ${q.moderation_reason}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(false);
    const res = await fetch("/api/mod/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSending(false);
    if (!res.ok) {
      setError(true);
      return;
    }
    onSignedIn();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs pb-24">
        <a href="/" aria-label="Homepage" className="inline-block text-sm">
          <Logo />
        </a>
        <h1 className="mt-6 text-xl font-semibold">Moderator sign-in</h1>
        <label
          htmlFor="mod-password"
          className="mt-6 block text-sm/6 font-medium"
        >
          Password
        </label>
        <input
          id="mod-password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 block w-full rounded-lg bg-white px-3 py-2.5 text-base/6 ring-1 ring-neutral-950/10 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-600 sm:py-1.5 sm:text-sm/6 dark:bg-white/5 dark:ring-white/10"
        />
        <button
          type="submit"
          disabled={sending}
          className="mt-4 w-full rounded-lg bg-orange-600 px-3 py-2.5 text-base font-semibold text-white hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 sm:py-1.5 sm:text-sm"
        >
          Sign in
        </button>
        <p
          aria-live="polite"
          className="mt-3 min-h-5 text-sm text-red-600 dark:text-red-400"
        >
          {error ? "Wrong password." : ""}
        </p>
      </form>
    </main>
  );
}
