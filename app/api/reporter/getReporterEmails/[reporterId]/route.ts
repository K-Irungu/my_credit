// app/api/email/getReporterEmails/[reporterId]/route.ts
import { NextRequest } from 'next/server';
import { getReporterEmails } from "@/controllers/reporter/getReporterEmailsController";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reporterId: string }> }
) {
    const { reporterId } = await params;
    return getReporterEmails(reporterId);
}

