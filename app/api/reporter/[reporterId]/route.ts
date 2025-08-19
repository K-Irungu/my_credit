import { getReporter } from "@/controllers/reporter/getReporterController";
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
    req: NextRequest,
    { params }: { params: { reporterId: string } }
) {
    const { reporterId } = params;
    return getReporter(reporterId);
}
