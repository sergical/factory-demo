"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/16/solid";
import { Logo } from "@/components/logo";
import { EVENT } from "@/lib/event";
import { timeAgo } from "@/lib/format";
import type { Question } from "@/lib/types";

const POLL_INTERVAL_MS = 5000;
const MAX_LENGTH = 280;

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "pending-review" };

export default function AudiencePage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });

  const refresh = useCallback(async () => {
    const res = await fetch("/api/questions", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setQuestions(data.questions);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || submit.kind === "sending") return;
    setSubmit({ kind: "sending" });

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, author_name: name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setSubmit({
        kind: "error",
        message: data?.error ?? "Something went wrong. Try again.",
      });
      return;
    }

    const data = await res.json();
    setBody("");
    if (data.question.status === "approved") {
      setSubmit({ kind: "idle" });
      refresh();
    } else if (data.question.status === "rejected") {
      setSubmit({ kind: "error", message: "That one didn't pass moderation." });
    } else {
      setSubmit({ kind: "pending-review" });
    }
  }

  async function handleVote(id: string) {
    setQuestions(
      (prev) =>
        prev?.map((q) =>
          q.id === id
            ? { ...q, voted: !q.voted, votes: q.votes + (q.voted ? -1 : 1) }
            : q
        ) ?? prev
    );
    await fetch(`/api/questions/${id}/vote`, { method: "POST" });
    refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-4 text-sm">
        <a href="/" aria-label="Homepage">
          <Logo />
        </a>
        <span className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-400">
          <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </header>

      <main className="flex-1 pb-24">
        <div className="pt-10 sm:pt-14">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-500">
            {EVENT.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {EVENT.title}
          </h1>
          <p className="mt-3 max-w-[55ch] text-base/7 text-pretty text-neutral-600 sm:text-sm/6 dark:text-neutral-400">
            {EVENT.tagline}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <label htmlFor="question-body" className="sr-only">
            Your question
          </label>
          <textarea
            id="question-body"
            name="question"
            rows={3}
            maxLength={MAX_LENGTH}
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              if (submit.kind !== "sending") setSubmit({ kind: "idle" });
            }}
            placeholder="What do you want to ask?"
            className="block w-full resize-none rounded-xl bg-white px-3.5 py-3 text-base/6 ring-1 ring-neutral-950/10 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-600 sm:text-sm/6 dark:bg-white/5 dark:ring-white/10 dark:placeholder:text-neutral-500"
          />
          <div className="mt-3 flex items-center gap-3">
            <label htmlFor="question-name" className="sr-only">
              Your name (optional)
            </label>
            <input
              id="question-name"
              name="name"
              type="text"
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name (optional)"
              className="block w-full min-w-0 flex-1 rounded-lg bg-white px-3 py-2.5 text-base/6 ring-1 ring-neutral-950/10 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-600 sm:py-1.5 sm:text-sm/6 dark:bg-white/5 dark:ring-white/10 dark:placeholder:text-neutral-500"
            />
            <span
              className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400"
              aria-hidden="true"
            >
              {MAX_LENGTH - body.length}
            </span>
            <button
              type="submit"
              disabled={submit.kind === "sending" || !body.trim()}
              className="shrink-0 rounded-lg bg-orange-600 px-3 py-2.5 text-base font-semibold text-white hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 sm:py-1.5 sm:text-sm"
            >
              {submit.kind === "sending" ? "Sending…" : "Ask"}
            </button>
          </div>
          <p
            aria-live="polite"
            className={`mt-2 min-h-5 text-sm ${
              submit.kind === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {submit.kind === "error"
              ? submit.message
              : submit.kind === "pending-review"
                ? "Sent. A moderator will review it shortly."
                : ""}
          </p>
        </form>

        <section className="mt-10">
          <div className="flex items-baseline gap-2">
            <h2 className="font-semibold">Questions</h2>
            {questions !== null && (
              <span className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
                {questions.length}
              </span>
            )}
          </div>

          {questions === null ? (
            <div className="mt-4 space-y-4" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-neutral-950/5 dark:bg-white/5"
                />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <p className="py-12 text-center text-base/7 text-neutral-500 sm:text-sm/6 dark:text-neutral-400">
              No questions yet. Be the first to raise a hand.
            </p>
          ) : (
            <ul
              role="list"
              className="mt-2 divide-y divide-neutral-950/5 dark:divide-white/10"
            >
              {questions.map((q) => (
                <li key={q.id} className="flex items-start gap-4 py-4">
                  <button
                    type="button"
                    onClick={() => handleVote(q.id)}
                    aria-pressed={q.voted}
                    aria-label={q.voted ? "Remove upvote" : "Upvote"}
                    className={`relative flex shrink-0 flex-col items-center rounded-lg px-3 py-2 text-base sm:px-2.5 sm:py-1.5 sm:text-sm ${
                      q.voted
                        ? "bg-orange-600/10 text-orange-700 ring-1 ring-orange-600/20 ring-inset dark:text-orange-400 dark:ring-orange-500/20"
                        : "text-neutral-600 ring-1 ring-neutral-950/10 ring-inset hover:bg-neutral-950/2.5 dark:text-neutral-400 dark:ring-white/10 dark:hover:bg-white/5"
                    } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600`}
                  >
                    <ChevronUpIcon
                      className={`size-4 shrink-0 ${
                        q.voted
                          ? "fill-orange-700 dark:fill-orange-400"
                          : "fill-neutral-600 dark:fill-neutral-400"
                      }`}
                    />
                    <span className="font-medium tabular-nums">{q.votes}</span>
                    <span
                      className="pointer-fine:hidden absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2"
                      aria-hidden="true"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-base/7 text-pretty sm:text-sm/6">
                      {q.body}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {q.author_name ?? "Anonymous"} · {timeAgo(q.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
