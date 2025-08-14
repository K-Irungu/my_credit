// app/api/admin/issues/list/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/requireAdmin";

export async function GET(req: Request) {
  // Check admin authentication
  const auth = await requireAdmin();
  if (!auth) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Fetch the list of issues from DB (placeholder for now)
  const issues = [
    { id: 1, title: "Login button is not working", status: "Open" },
    { id: 2, title: "Incorrect data on dashboard", status: "In Progress" },
  ];

  return NextResponse.json({
    ok: true,
    issues,
  });
}
