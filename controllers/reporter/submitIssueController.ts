import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import Issue from "@/models/issue";
import Reporter from "@/models/reporter";
import { connectToDB } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendAlertToAdmin } from "@/utils/sendAlertToAdmin";

interface Context {
  ipAddress: string;
  endpoint: string;
}

function generateUniqueREF(): string {
  return uuidv4();
}

// The function now correctly accepts formData and the context object
export async function submitIssue(formData: FormData, context: Context) {
  try {
    await connectToDB();

    const personnelData = formData.get("personnel");
    const malpracticeData = formData.get("malpractice");
    const whistleblowerData = formData.get("whistleblower");
    const supportingFile = formData.get("supportingFile");
    const browserData = formData.get("browser");

    const { ipAddress, endpoint } = context;


    if (!personnelData || !malpracticeData || !whistleblowerData || !browserData) {
      return {
        status: 400,
        message: "Missing required fields",
        data: null,
      };
    }

    const personnel = JSON.parse(personnelData as string);
    const malpractice = JSON.parse(malpracticeData as string);
    const whistleblower = JSON.parse(whistleblowerData as string);
    
    // Correctly handle the browser data as a plain string, not JSON
    const browser = browserData as string;

    let supportingFileName = null;
    if (supportingFile && typeof supportingFile !== "string") {
      const file = supportingFile as File;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + "-" + file.name.replace(/\s/g, "-");
      const uploadPath = path.join(process.cwd(), "public/uploads", filename);

      await writeFile(uploadPath, buffer);

      supportingFileName = filename;
    }

    const newReporter = new Reporter({
      firstName: whistleblower.firstName,
      lastName: whistleblower.lastName,
      email: whistleblower.email,
      phoneNumber: whistleblower.phoneNumber,
      company: whistleblower.company || null,
      role: whistleblower.role || null,
      requiresFeedback: whistleblower.requiresFeedback || false, 
      REF: generateUniqueREF(),
    });
    const reporter = await newReporter.save();

    const newIssue = new Issue({
      implicatedPersonel: personnel,
      malpractice: malpractice,
      reporter: reporter._id,
      source: "web",
      filename: supportingFileName,
      REF: generateUniqueREF(),
    });
    await newIssue.save();

    // Placeholder for email function call
    await sendAlertToAdmin(browser, context, reporter );

    return {
      status: 201,
      message: "Issue submitted successfully",
      data: {
        personnel,
        malpractice,
        supportingFileName,
        newIssueId: newIssue._id,
      },
    };
  } catch (error: any) {
    console.error("Error submitting issue:", error);
    return {
      status: 500,
      message: "Failed to submit issue",
      data: null,
    };
  }
}