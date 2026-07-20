# Handraise

Live audience Q&A for events and streams. Attendees submit questions and
upvote the ones they want answered; moderators curate the queue in real time.
Incoming questions pass through an AI moderation step before they appear
publicly.

## How it works

- **Audience page (`/`)** — submit a question (optionally with your name),
  upvote others. The list re-ranks live by votes.
- **Moderator dashboard (`/mod`)** — password-protected review queue.
  Questions the AI moderator is unsure about wait here; moderators can
  approve or reject anything at any time.
- **Moderation** — every submission is classified by Claude
  (approve / review / reject, plus a topic category) before it is stored.
  If moderation is unavailable, questions fall back to the human review queue.

## Stack

- Next.js (App Router) on Vercel
- Postgres (Neon) — `questions` and `votes` tables, see `db/schema.sql`
- Anthropic API for question moderation (`src/lib/moderation.ts`)
- Sentry for errors, tracing, logs, and session replay

## Development

```bash
npm install
vercel env pull .env.local   # DATABASE_URL, MOD_PASSWORD, ANTHROPIC_API_KEY
npm run db:setup             # apply db/schema.sql
npm run dev
```

## Environment variables

| Name                | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `DATABASE_URL`      | Postgres connection string (pooled)                 |
| `ANTHROPIC_API_KEY` | Question moderation; omit to send all to review     |
| `MOD_PASSWORD`      | Shared moderator password for `/mod`                |
