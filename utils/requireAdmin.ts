// utils/requireAdmin.ts
import { cookies } from "next/headers";
import Admin from "@/models/admin";
import { getSessionFromCookie } from "@/utils/session";

export async function requireAdmin() {
  const cookieStore = await cookies(); // <- await it
  const sessionId = cookieStore.get("session")?.value;
  const session = await getSessionFromCookie(sessionId);
  if (!session) return null; // not authenticated or expired

  const admin = await Admin.findById(session.userId).lean();
  if (!admin) return null;

  return { admin, session };
}
