import { updateIssueController } from "@/controllers/admin/issues/updateIssueController";
import { getIssueByRef } from "@/controllers/admin/issues/getIssueByREFController";

// GET issue by REF
export async function GET(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  return await getIssueByRef(ref);
}

// UPDATE issue by REF
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
    const { ref } = await params;

  return await updateIssueController(req, { ref });
}
