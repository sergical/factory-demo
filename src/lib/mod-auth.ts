import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const MOD_COOKIE = "hr_mod";

function sessionToken(): string {
  const password = process.env.MOD_PASSWORD;
  if (!password) return "";
  return createHmac("sha256", password).update("handraise-mod").digest("hex");
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.MOD_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createModSession(): Promise<void> {
  const store = await cookies();
  store.set(MOD_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
}

export async function isModerator(): Promise<boolean> {
  const token = sessionToken();
  if (!token) return false;
  const store = await cookies();
  const cookie = store.get(MOD_COOKIE)?.value;
  return cookie === token;
}
