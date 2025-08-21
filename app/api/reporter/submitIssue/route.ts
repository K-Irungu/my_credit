import { submitIssue } from "@/controllers/reporter/submitIssueController";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    
    // Get IP address from request headers
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const endpoint = "/api/reporter/submitIssue";

    // Call the controller with the formData and the new context object
    const result = await submitIssue(formData, {
        ipAddress,
        endpoint
    });


    if (!result.data) {
      return NextResponse.json(
        { status: result.status, message: result.message, data: null },
        { status: result.status }
      );
    }

    return NextResponse.json(
      { status: result.status, message: result.message, data: result.data },
      { status: result.status }
    );
  } catch (error) {
    console.error("Submit issue route error:", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error", data: null },
      { status: 500 }
    );
  }
}