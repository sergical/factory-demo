import { NextResponse } from "next/server";
import { isModerator } from "@/lib/mod-auth";
import { listAll } from "@/lib/questions";

export async function GET() {
  if (!(await isModerator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const questions = await listAll();
  return NextResponse.json({ questions });
}
