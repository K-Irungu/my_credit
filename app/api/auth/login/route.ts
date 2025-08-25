import { NextResponse } from "next/server";
import { login } from "@/controllers/auth/loginController";

export async function POST(req: Request) { 
  const secret_key = process.env.SITE_KEY;

  console.log("Secret Key:", secret_key); // Debugging line
  try {
    // 1) Validate input
    const { email, password, deviceId, browser, reCaptchaValue } = await req.json();

    if (!email || !password || !deviceId || !browser || !reCaptchaValue) {
      return NextResponse.json(
        { status: 400, message: "Email, password, deviceId, browser and reCaptchaValue are required", data: null },
        { status: 400 }
      );
    }

    // console.log(reCaptchaValue)

    // 2) Get IP address
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 3) Define endpoint
    const endpoint = "/api/auth/login";

    // 4) Authenticate user
    const result = await login(email, password, deviceId, reCaptchaValue, {
      browser,
      ipAddress,
      endpoint,
    });

    if (!result.data) {
      return NextResponse.json(
        { status: result.status, message: result.message, data: null },
        { status: result.status }
      );
    }

    // 5) Return success response
    return NextResponse.json(
      {
        status: result.status,
        message: result.message,
        data: { fullName: result.data.fullName },
      },
      { status: result.status }
    );
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
