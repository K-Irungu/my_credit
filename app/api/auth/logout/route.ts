// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeSessionById } from "@/utils/session";
import { clearSessionCookie } from "@/utils/cookies";

export async function POST() {
  const cookieStore = await cookies(); // <- await it

  const sessionId = cookieStore.get("session")?.value;

  if (sessionId) {
    await revokeSessionById(sessionId);
  }

  clearSessionCookie();

  return NextResponse.json({ ok: true, message: "Logged out successfully" });
}
