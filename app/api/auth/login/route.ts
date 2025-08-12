import { NextResponse } from "next/server";
import { login } from "@/controllers/auth/loginController";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    const { email, password, deviceId } = await req.json();

    if (!email || !password || !deviceId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Email, password and deviceId are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const result = await login(email, password, deviceId);

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
