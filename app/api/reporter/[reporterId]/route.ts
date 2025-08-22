import { getReporter } from "@/controllers/reporter/getReporterController";
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
    req: NextRequest,
  { params }: { params: Promise<{ reporterId: string }> }
) {
    const { reporterId } = await params;
    return getReporter(reporterId);
}
