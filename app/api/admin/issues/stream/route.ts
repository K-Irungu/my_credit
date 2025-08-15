// app/api/admin/issues/stream/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Issue from "@/models/issue";

export const dynamic = "force-dynamic";

export async function GET() {
  let intervalId: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const fetchAndSendIssues = async () => {
        try {
          await connectToDB();
          const issues = await Issue.find({}).sort({ createdAt: -1 }).populate("reporter").lean();
          const data = `data: ${JSON.stringify(issues)}\n\n`;
          controller.enqueue(data);
        } catch (error) {
          console.error("Error fetching data for stream:", error);
          if (intervalId) {
            clearInterval(intervalId);
          }
          controller.error(error);
        }
      };

      intervalId = setInterval(fetchAndSendIssues, 5000);
      await fetchAndSendIssues();
    },

    cancel() {
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