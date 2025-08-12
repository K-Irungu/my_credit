import { NextResponse } from "next/server";
import { logout } from "../../../../controllers/auth/logoutController";
import logger from "@/lib/logger";
import { parse } from "cookie";


export async function POST(req: Request) {
  try {
    // 1) Extract token from cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return NextResponse.json(
        { status: 401, message: "Authorization token missing", data: null },
        { status: 401 }
      );
    }

    // 2) Clear the admin's sessionToken and deviceId
    const result = await logout(token);

    // 3) Return the result of the deleting of  sessionToken and deviceId
    return NextResponse.json(
      { status: result.status, message: result.message, data: result.data },
      { status: result.status }
    );
  } catch (error) {
    logger.error("Logout error", error);
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}
