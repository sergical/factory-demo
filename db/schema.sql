create extension if not exists pgcrypto;

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  author_name text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  category text,
  moderation_reason text,
  submitter_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists questions_status_created_idx
  on questions (status, created_at desc);

create table if not exists votes (
  question_id uuid not null references questions (id) on delete cascade,
  voter_id text not null,
  created_at timestamptz not null default now(),
  primary key (question_id, voter_id)
);
