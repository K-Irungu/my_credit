import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Reporter from "@/models/reporter";
import { Types } from "mongoose";

interface ReporterData {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getReporter = async (reporterId: string) => {
        console.log(reporterId)

  try {
    // Validate reporterId
    if (!reporterId || !Types.ObjectId.isValid(reporterId)) {
      return NextResponse.json(
        { 
          status: "error",
          message: "Invalid reporter ID format",
          data: null 
        },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDB();



    // Find reporter by ID and exclude the __v field
    const reporter = await Reporter.findById(reporterId)
      .select('-__v')
      .lean<ReporterData>();

    if (!reporter) {
      return NextResponse.json(
        { 
          status: "error",
          message: "Reporter not found",
          data: null 
        },
        { status: 404 }
      );
    }


    return NextResponse.json(
      { 
        status: "success",
        message: "Reporter fetched successfully",
        data: reporter 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching reporter:', error);
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