import { NextRequest, NextResponse } from "next/server";
import { getAllIssues } from "../../../../../controllers/admin/issues/getAllIssuesController"

export async function GET(req: NextRequest) {
  try {
    const issues = await getAllIssues();

    return NextResponse.json(issues);
  } catch (err: any) {
    console.error("Error in /api/admin/issues/list (GET):", err);
    return NextResponse.json(
      { error: err.message || "Could not fetch issues" },
      { status: 500 }
    );
  }
}
