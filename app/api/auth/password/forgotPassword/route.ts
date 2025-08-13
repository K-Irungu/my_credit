import { NextResponse } from "next/server";
import { forgotPassword } from "@/controllers/auth/password/forgotPasswordController";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    const { email, deviceId, browser } = await req.json();

    if (!email || !deviceId || !browser) {
      return NextResponse.json(
        {
          status: 400,
          message: "Email, browser and deviceId are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const endpoint = "/api/auth/forgot-password";

    const result = await forgotPassword(email, deviceId, {
      browser,
      ipAddress,
      endpoint,
    });

    if (!result.data) {
      return NextResponse.json(
        {
          status: result.status,
          message: result.message,
          data: null,
        },
        { status: result.status }
      );
    }

    // Set cookie only if token exists in result.data
    let headers = {};
    if (result.data) {
      const cookie = serialize("token", result.data, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
      headers = { "Set-Cookie": cookie };
    }

    return NextResponse.json(
      {
        status: result.status,
        message: result.message,
        data: { fullName: result.data },
      },
      {
        status: result.status,
        headers,
      }
    );
  } catch (error) {
    console.error("Forgot password route error:", error);
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
