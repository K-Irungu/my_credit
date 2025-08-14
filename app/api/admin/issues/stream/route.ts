// app/api/admin/issues/stream/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Issue from "@/models/issue";

export const dynamic = "force-dynamic";

export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      // Set up an interval to send new data every 5 seconds
      // Re-using the logic to fetch issues from the database
      const fetchAndSendIssues = async () => {
        try {
          await connectToDB();
          const issues = await Issue.find({}).lean();

          // Format the data as a Server-Sent Event
          const data = `data: ${JSON.stringify({ issues })}\n\n`;
          controller.enqueue(data);
        } catch (error) {
          console.error("Error fetching data for stream:", error);
          // If there's an error, clear the interval and close the stream
          clearInterval(intervalId);
          controller.error(error);
        }
      };
      const intervalId = setInterval(fetchAndSendIssues, 5000);

      // Send initial data immediately
      await fetchAndSendIssues();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
