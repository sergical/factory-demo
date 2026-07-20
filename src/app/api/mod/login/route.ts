import { NextResponse } from "next/server";
import { createModSession, verifyPassword } from "@/lib/mod-auth";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload.password !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!verifyPassword(payload.password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  await createModSession();
  return NextResponse.json({ ok: true });
}
