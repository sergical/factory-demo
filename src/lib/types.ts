export type QuestionStatus = "pending" | "approved" | "rejected";

export type Question = {
  id: string;
  body: string;
  author_name: string | null;
  status: QuestionStatus;
  category: string | null;
  moderation_reason: string | null;
  created_at: string;
  votes: number;
  voted: boolean;
};
