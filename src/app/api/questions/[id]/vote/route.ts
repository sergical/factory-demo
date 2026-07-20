import { NextResponse } from "next/server";
import { getOrCreateVoterId } from "@/lib/identity";
import { toggleVote } from "@/lib/questions";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const voterId = await getOrCreateVoterId();
  const result = await toggleVote(id, voterId);
  return NextResponse.json(result);
}
