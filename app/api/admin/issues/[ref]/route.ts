import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import IssueModel from "@/models/issue";
import { updateIssueController } from '@/controllers/admin/issues/updateIssueController';


type ImplicatedPersonnel = {
  firstName: string;
  lastName: string;
  companyLocation: string;
  rolePosition: string;
  phoneNumber: string;
};

type Malpractice = {
  type: string;
  location: string;
  description: string;
  isOngoing: string;
};

export type IssueType = {
  _id: string;
  implicatedPersonel: ImplicatedPersonnel;
  malpractice: Malpractice;
  reporter: string;
  status: string;
  source: string;
  filename: string;
  REF: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export async function GET(
  req: Request,
  { params }: { params: { ref: string } }
) {
  const { ref } = await params;

  try {
    await connectToDB();
    const issue = await IssueModel.findOne({ REF: ref }).lean<IssueType>();

    if (!issue) {
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
        message: "Issue retrieved successfully.",
        data: issue,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Server error. Please try again later.",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { ref: string } }) {
  return await updateIssueController(req, params);
}