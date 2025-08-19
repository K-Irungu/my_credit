import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/sendEmail";
import Reporter from "@/models/reporter";
import { connectToDB } from "@/lib/db";
import Issue from "@/models/issue";
import { Types } from "mongoose";

// Define the types for the request body
interface RequestBody {
  reporter: string;
  issueRef: string;
  status: string;
  malpractice?: {
    type?: string;
    location?: string;
    description?: string;
  };
}

// Type for the issue document
interface IssueDocument {
  REF: string;
  reporter: Types.ObjectId | string;
  status: string;
  malpractice?: {
    type?: string;
    location?: string;
    description?: string;
  };
}

// Type for the reporter document
interface ReporterDocument {
  _id: Types.ObjectId;
  email?: string;
}

export async function POST(req: Request) {
  try {
    // Connect to the database
    await connectToDB();

    // Parse the request body
    const body = await req.json();
    const { issueRef, status }: RequestBody = body;

    // Check for required fields
    if (!issueRef || !status) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields.",
          data: null,
        },
        { status: 400 }
      );
    }

    // Find the issue
    const issue = await Issue.findOne({ REF: issueRef }).lean<IssueDocument>();
    if (!issue) {
      return NextResponse.json(
        {
          status: "error",
          message: "Issue not found.",
          data: null,
        },
        { status: 404 }
      );
    }

    const reporterId = issue.reporter;

    // Fetch reporter's email
    const reporterDoc = await Reporter.findById(reporterId).lean<ReporterDocument>();
    if (!reporterDoc || !reporterDoc.email) {
      return NextResponse.json(
        {
          status: "error",
          message: "Reporter not found or missing email.",
          data: null,
        },
        { status: 404 }
      );
    }

    const subject = `Update on your reported issue (${issueRef})`;
    const text = `
Hello,

Your reported issue (${issueRef}) has been updated.

Current Status: ${status}
Malpractice Type: ${issue.malpractice?.type ?? ""}
Malpractice Location: ${issue.malpractice?.location ?? ""}
Description: ${issue.malpractice?.description ?? ""}

Thank you,
MyCredit Team
    `;

    // Send the email
    await sendEmail({
      to: reporterDoc.email,
      subject,
      text,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Notification email sent.",
        data: null,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error sending notification email:", errorMessage);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to send notification email.",
        data: null,
      },
      { status: 500 }
    );
  }
}