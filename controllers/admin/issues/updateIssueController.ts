import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Issue from '@/models/issue';

export async function updateIssueController(req: Request, params: { ref: string }) {
  try {
    await connectToDB();
    const updates = await req.json(); // <-- Accept the whole body as updates
    const { ref } = params;

    // Debug logs
    console.log('Update REF:', ref);
    console.log('Update payload:', updates);

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "No updates provided.",
          data: null,
        },
        { status: 400 }
      );
    }

    const updatedIssue = await Issue.findOneAndUpdate(
      { REF: ref },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updatedIssue) {
      return NextResponse.json(
        {
          status: "error",
          message: "Issue not found. Please check the REF and try again.",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Issue updated successfully.",
        data: updatedIssue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update issue.",
        data: null,
      },
      { status: 500 }
    );
  }
}