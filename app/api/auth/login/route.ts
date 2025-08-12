import { NextResponse } from "next/server";
import { login } from "@/controllers/auth/loginController";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    const { email, password, deviceId, browser } = await req.json();

    if (!email || !password || !deviceId ||!browser) {
      return NextResponse.json(
        {
          status: 400,
          message: "Email, password and deviceId are required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Extract IP address from headers or connection info
    // Note: 'req' is a native Request object, so to access headers:
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Define the API endpoint for audit trail
    const endpoint = "/api/auth/login";

    const result = await login(email, password, deviceId, {
      browser,
      ipAddress,
      endpoint,
    });

    if (!result.data) {
      // Handle no data case or throw error
      return NextResponse.json(
        {
          status: result.status,
          message: result.message,
          data: null,
        },
        { status: result.status }
      );
    }

    const cookie = serialize("token", result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour in seconds
    });

    return NextResponse.json(
      {
        status: result.status,
        message: result.message,
        data: { fullName: result.data.fullName },
      },
      {
        status: result.status,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
