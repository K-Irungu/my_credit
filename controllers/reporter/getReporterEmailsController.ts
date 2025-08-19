// app/controllers/reporter/getReporterEmailsController.ts
import { NextResponse } from "next/server";
import emailLog from "@/models/emailLog"; // Assuming you have an Email model
import Reporter from "@/models/reporter"; // Assuming you have an Email model
import { connectToDB } from "@/lib/db"; // Your MongoDB connection utility

export async function getReporterEmails(reporterId: string) {
  try {
    // Validate reporterId
    if (!reporterId || typeof reporterId !== "string") {
      return NextResponse.json(
        { error: "Invalid reporter ID" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDB();

    const reporter = await Reporter.findById(reporterId);
    const reporterEmail = reporter?.email;

    // Fetch reporter emails from MongoDB
    const emails = await emailLog
      .find({ to: reporterEmail })
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .lean(); // Convert to plain JavaScript objects

      console.log(emails)

    // Return the emails
    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching reporter emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch reporter emails" },
      { status: 500 }
    );
  }
}
