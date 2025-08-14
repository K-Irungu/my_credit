// app/api/admin/issues/stream/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Issue from "@/models/issue";

export const dynamic = "force-dynamic";

export async function GET() {
  let intervalId: NodeJS.Timeout | null = null; // Declare intervalId here

  const stream = new ReadableStream({
    async start(controller) {
      const fetchAndSendIssues = async () => {
        try {
          await connectToDB();
          const issues = await Issue.find({}).lean();
          const data = `data: ${JSON.stringify({ issues })}\n\n`;
          controller.enqueue(data);
        } catch (error) {
          console.error("Error fetching data for stream:", error);
          if (intervalId) {
            clearInterval(intervalId);
          }
          controller.error(error);
        }
      };

      // Set up the interval
      intervalId = setInterval(fetchAndSendIssues, 5000);

      // Send initial data immediately
      await fetchAndSendIssues();
    },

    cancel() {
      // This function is called when the stream is closed or the client disconnects
      if (intervalId) {
        clearInterval(intervalId);
      }
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