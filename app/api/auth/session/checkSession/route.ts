import { NextResponse } from "next/server";
import { checkSession } from "../../../../../controllers/auth/session/checkSessionController";

export async function GET(req: Request) {
  try {
    // 1) Extract bearer token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { status: 401, message: "Authorization token missing", data: [] },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];

    // 2) Get session information
    const result = await checkSession(token);

    // 3) Return session information
    return NextResponse.json(
      {
        status: result.status,
        message: result.message,
        data: result.data,
      },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("Check session error:", error);

    const status =
      error.message.includes("Invalid") || error.message.includes("not found")
        ? 401
        : 500;

    return NextResponse.json(
      { status, message: error.message || "Internal server error", data: null },
      { status }
    );
  }
}
