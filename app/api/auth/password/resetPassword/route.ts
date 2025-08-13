// /app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
 import { resetPassword } from "@/controllers/auth/password/resetPasswordController";
export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword, deviceId } = await req.json();

    // Basic validation to ensure required fields are present
    if (!email || !token || !newPassword || !deviceId) {
      return NextResponse.json({
        status: 400,
        message: "Missing required fields: token, newPassword, or deviceId",
      });
    }

    // Extract metadata for audit logging from the request headers
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const browser = req.headers.get("user-agent") || "unknown";
    const endpoint = req.url;

    // Prepare the context object for the controller
    const context = { browser, ipAddress, endpoint, deviceId };

    // Call the core controller function to handle the password reset logic
    const result = await resetPassword( email, token, newPassword, context);

    // Return the response from the controller
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { status: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
