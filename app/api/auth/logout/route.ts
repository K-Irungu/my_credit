import { NextResponse } from "next/server";
import { logout } from "@/controllers/auth/logoutController";


export async function POST(req: Request) {
  try {
    // 1) Parse request body
    const { deviceId, browser } = await req.json();
    if (!deviceId || !browser) {
      return NextResponse.json(
        { status: 400, message: "DeviceId and information is required", data: null },
        { status: 400 }
      );
    }

    // 2) Get IP address
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 3) Define endpoint
    const endpoint = "/api/auth/logout";


    // 5) Call the logout controller
    const result = await logout(deviceId, {
      browser,
      ipAddress,
      endpoint,
    });

    // 6) Return controller's response
    return NextResponse.json(
      { status: result.status, message: result.message, data: result.data },
      { status: result.status }
    );
  } catch (error) {
    console.error("Logout route error:", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}
