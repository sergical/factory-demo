import { NextResponse } from "next/server";
import { isModerator } from "@/lib/mod-auth";
import { setStatus } from "@/lib/questions";

const STATUSES = ["pending", "approved", "rejected"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isModerator())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const status = payload?.status;
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await setStatus(id, status);
  return NextResponse.json({ ok: true });
}
