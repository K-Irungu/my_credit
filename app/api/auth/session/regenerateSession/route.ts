
import { NextResponse } from "next/server";
import { regenerateSession } from "../../../../../controllers/auth/session/regenerateSessionController";


export async function POST(req: Request) {
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

    // 2) Regenerate session
    const result = await regenerateSession(token);

    // 3) Return session information
    return NextResponse.json(
      {
        status: result.status,
        message: result.message,
        data: result.data,
      },
      { status: result.status }
    );
  } catch (error) {

    return NextResponse.json(
      { status: 500, message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
}
