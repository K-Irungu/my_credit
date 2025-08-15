import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import Issue from "@/models/issue";
import Reporter from "@/models/reporter";
import { connectToDB } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

function generateUniqueREF(): string {
  return uuidv4();
}

export async function submitIssue(req: Request) {
  try {
    // Await the database connection to ensure it's established before proceeding
    await connectToDB();

    const formData = await req.formData();
    const personnelData = formData.get("personnel");
    const malpracticeData = formData.get("malpractice");
    const whistleblowerData = formData.get("whistleblower");
    const supportingFile = formData.get("supportingFile");

    if (!personnelData || !malpracticeData || !whistleblowerData) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "Missing required JSON fields: personnel, malpractice, or whistleblower",
          data: null,
        },
        { status: 400 }
      );
    }

    const personnel = JSON.parse(personnelData as string);
    const malpractice = JSON.parse(malpracticeData as string);
    const whistleblower = JSON.parse(whistleblowerData as string);

    let supportingFileName = null;
    if (supportingFile && typeof supportingFile !== "string") {
      const file = supportingFile as File;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + "-" + file.name.replace(/\s/g, "-");
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(uploadPath, buffer);
      supportingFileName = filename;
    }

    // First, save the reporter details
    const newReporter = new Reporter({
      firstName: whistleblower.firstName,
      lastName: whistleblower.lastName,
      email: whistleblower.email,
      phoneNumber: whistleblower.phoneNumber,
      company: whistleblower.company || null,
      role: whistleblower.role || null,
      requiresFeedback: whistleblower.wantsFeedback || false, // Mapping 'wantsFeedback' from whistleblower object to 'requiresFeedback' in schema
      REF: generateUniqueREF(),
    });
    const reporter = await newReporter.save();


    // Then, create the issue using the new reporter's ID
    const newIssue = new Issue({
      implicatedPersonel: personnel,
      malpractice: malpractice,
      reporter: reporter._id, // Use the ID of the saved reporter
      source: "web",
      filename: supportingFileName,
      REF: generateUniqueREF(),
    });
    await newIssue.save();

    // console.log(newIssue);

    return NextResponse.json(
      {
        status: 201,
        message: "Issue submitted successfully",
        data: {
          personnel,
          malpractice,
          supportingFileName,
          newIssueId: newIssue._id,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting issue:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Failed to submit issue",
        data: null,
      },
      { status: 500 }
    );
  }
}
