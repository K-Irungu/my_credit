import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Issue from "@/models/issue";



export const getIssueByRef = async (ref: string) => {
  try {
    await connectToDB();
    const issue = await Issue.findOne({ REF: ref });

    if (!issue) {
      return NextResponse.json(
        { 
          status: "error",
          message: "Issue   not found",
          data: null 
        },
        { status: 404 }
      );
    }


    return NextResponse.json(
      { 
        status: "success",
        message: "Issue fetched successfully",
        data: issue 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: "Internal server error",
        data: null 
      },
      { status: 500 }
    );
  }
};