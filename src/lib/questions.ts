import * as Sentry from "@sentry/nextjs";
import { sql } from "./db";
import { moderateQuestion } from "./moderation";
import type { Question, QuestionStatus } from "./types";

const { logger } = Sentry;

const MAX_BODY_LENGTH = 280;
const SUBMISSIONS_PER_MINUTE = 3;

export class SubmissionError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function listApproved(voterId: string | null): Promise<Question[]> {
  const rows = await sql`
    select
      q.id, q.body, q.author_name, q.status, q.category,
      q.moderation_reason, q.created_at,
      count(v.voter_id)::int as votes,
      bool_or(v.voter_id = ${voterId ?? ""}) as voted
    from questions q
    left join votes v on v.question_id = q.id
    where q.status = 'approved'
    group by q.id
    order by votes desc, q.created_at asc
  `;
  return rows.map(toQuestion);
}

export async function listAll(): Promise<Question[]> {
  const rows = await sql`
    select
      q.id, q.body, q.author_name, q.status, q.category,
      q.moderation_reason, q.created_at,
      count(v.voter_id)::int as votes,
      false as voted
    from questions q
    left join votes v on v.question_id = q.id
    group by q.id
    order by q.created_at desc
  `;
  return rows.map(toQuestion);
}

export async function submitQuestion(params: {
  body: string;
  authorName: string | null;
  submitterId: string;
}): Promise<Question> {
  const body = params.body.trim();
  if (!body) {
    throw new SubmissionError("Question can't be empty", 400);
  }
  if (body.length > MAX_BODY_LENGTH) {
    throw new SubmissionError(
      `Keep it under ${MAX_BODY_LENGTH} characters`,
      400
    );
  }

  const [{ recent }] = await sql`
    select count(*)::int as recent from questions
    where submitter_id = ${params.submitterId}
      and created_at > now() - interval '60 seconds'
  `;
  if (recent >= SUBMISSIONS_PER_MINUTE) {
    logger.warn("Submission rate limit hit", {
      submitter_id: params.submitterId,
      recent_submissions: recent,
    });
    throw new SubmissionError("Slow down — try again in a minute", 429);
  }

  const moderation = await moderateQuestion(body);
  const status: QuestionStatus =
    moderation.verdict === "approve"
      ? "approved"
      : moderation.verdict === "reject"
        ? "rejected"
        : "pending";

  const [row] = await sql`
    insert into questions (body, author_name, status, category, moderation_reason, submitter_id)
    values (${body}, ${params.authorName}, ${status}, ${moderation.category},
            ${moderation.reason}, ${params.submitterId})
    returning id, body, author_name, status, category, moderation_reason, created_at,
              0::int as votes, false as voted
  `;
  logger.info("Question submitted", {
    question_id: row.id as string,
    status,
    category: moderation.category,
  });
  return toQuestion(row);
}

export async function toggleVote(
  questionId: string,
  voterId: string
): Promise<{ votes: number; voted: boolean }> {
  const removed = await sql`
    delete from votes
    where question_id = ${questionId} and voter_id = ${voterId}
    returning question_id
  `;
  if (removed.length === 0) {
    await sql`
      insert into votes (question_id, voter_id)
      values (${questionId}, ${voterId})
      on conflict do nothing
    `;
  }
  const [{ votes }] = await sql`
    select count(*)::int as votes from votes where question_id = ${questionId}
  `;
  return { votes, voted: removed.length === 0 };
}

export async function setStatus(
  id: string,
  status: QuestionStatus
): Promise<void> {
  await sql`update questions set status = ${status} where id = ${id}`;
  logger.info("Moderator changed question status", {
    question_id: id,
    status,
  });
}

function toQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as string,
    body: row.body as string,
    author_name: row.author_name as string | null,
    status: row.status as QuestionStatus,
    category: row.category as string | null,
    moderation_reason: row.moderation_reason as string | null,
    created_at: new Date(row.created_at as string | Date).toISOString(),
    votes: (row.votes as number) ?? 0,
    voted: Boolean(row.voted),
  };
}
