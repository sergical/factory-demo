import { NextResponse } from "next/server";
import { getOrCreateVoterId, getVoterId } from "@/lib/identity";
import {
  listApproved,
  submitQuestion,
  SubmissionError,
} from "@/lib/questions";

export async function GET() {
  const voterId = await getVoterId();
  const questions = await listApproved(voterId);
  return NextResponse.json({ questions });
}

export async function POST(request: Request) {
  const submitterId = await getOrCreateVoterId();
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload.body !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const authorName =
    typeof payload.author_name === "string" && payload.author_name.trim()
      ? payload.author_name.trim().slice(0, 60)
      : null;

  try {
    const question = await submitQuestion({
      body: payload.body,
      authorName,
      submitterId,
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    if (error instanceof SubmissionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    throw error;
  }
}
