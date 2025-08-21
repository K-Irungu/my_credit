import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import Issue from "@/models/issue";
import Reporter from "@/models/reporter";
import { connectToDB } from "@/lib/db";
import { sendAlertToAdmin } from "@/utils/sendAlertToAdmin";
import { sendAlertToReporter } from "@/utils/sendAlertToReporter";

import { createReporter } from "@/controllers/reporter/createReporterController";
import logger from "@/lib/logger";
import { recordAuditTrail } from "@/utils/recordAuditTrail";

// Types
interface Context {
  ipAddress: string;
  endpoint: string;
}

// Helpers
function generateUniqueREF(): string {
  return uuidv4();
}

// Main Function
export async function submitIssue(formData: FormData, context: Context) {
  const { ipAddress, endpoint } = context;

  try {
    await connectToDB();

    // Extract FormData
    const personnelData = formData.get("implicatedPersonnel");
    const malpracticeData = formData.get("malpractice");
    const browserData = formData.get("browser");
    const anonymityData = formData.get("isAnonymous");

    const supportingFile = formData.get("supportingFile")
      ? formData.get("supportingFile")
      : null;

    const reporterData = formData.get("reporter")
      ? formData.get("reporter")
      : null;

    // Validate Required Fields
    if (!personnelData || !malpracticeData || !browserData || !anonymityData) {
      await recordAuditTrail({
        browser: " ",
        ipAddress,
        deviceId: null,
        activity: `Failed issue submission attempt. Missing required fields.`,
        endpoint,
        userDetails: {
          userId: null,
          model: "Unknown",
          name: null,
          role: null,
        },
        dataInTransit: { data: "unknown" },
      });

      return {
        status: 400,
        message: "Missing required fields",
        data: null,
      };
    }

    // Parse JSON fields
    const personnel = JSON.parse(personnelData as string);
    const malpractice = JSON.parse(malpracticeData as string);
    const browser = browserData as string;
    const isAnonymous = (anonymityData as string) === "true";
    const reporter = isAnonymous ? null : JSON.parse(reporterData as string);

    // Handle File Upload
    let supportingFileName: string | null = null;
    if (supportingFile && typeof supportingFile !== "string") {
      try {
        const file = supportingFile as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
        const uploadPath = path.join(process.cwd(), "public/uploads", filename);

        await writeFile(uploadPath, buffer);
        supportingFileName = filename;

        await recordAuditTrail({
          browser,
          ipAddress,
          deviceId: null,
          activity: `Supporting file uploaded successfully.`,
          endpoint,
          userDetails: {
            userId: null,
            model: "Unknown",
            name: null,
            role: null,
          },
          dataInTransit: { filename },
        });
      } catch (fileError) {
        await recordAuditTrail({
          browser,
          ipAddress,
          deviceId: null,
          activity: `File upload failed.`,
          endpoint,
          userDetails: {
            userId: null,
            model: "Unknown",
            name: null,
            role: null,
          },
          dataInTransit: { error: "File upload error" },
        });
        // Continue without file
        console.error(
          "File upload failed, continuing without file.",
          fileError
        );
      }
    }

    // Determine feedback requirement
    const requiresFeedback =
      !isAnonymous && reporter?.requiresFeedback === "YES";

    // Create reporter payload
    const createReporterBody = {
      firstName: reporter?.firstName ?? null,
      lastName: reporter?.lastName ?? null,
      email: reporter?.email ?? null,
      phoneNumber: reporter?.phoneNumber ?? null,
      company: reporter?.company ?? null,
      role: reporter?.role ?? null,
      requiresFeedback,
      REF: generateUniqueREF(),
      isAnonymous: isAnonymous,
    };

    // Create new reporter (anonymous or full) Errors handled in create reporter function
    let newReporter;
    try {
      newReporter = await createReporter(createReporterBody, context, browser);

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: null,
        activity: `Reporter created successfully.`,
        endpoint,
        userDetails: {
          userId: newReporter._id,
          model: "Reporter",
          name: `${newReporter.firstName} ${newReporter.lastName}`,
          role: newReporter.role,
        },
        dataInTransit: { email: newReporter.email },
      });
    } catch (reporterError) {
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: null,
        activity: `Reporter creation failed.`,
        endpoint,
        userDetails: {
          userId: null,
          model: "Unknown",
          name: null,
          role: null,
        },
        dataInTransit: { error: "Reporter creation error" },
      });

      console.error("Error creating reporter:", reporterError);
      logger.warn("Failed to create reporter:", reporterError);

      return {
        status: 500,
        message: "Failed to create reporter",
        data: null,
      };
    }

    // Create Issue
    try {
      const newIssue = new Issue({
        implicatedPersonel: personnel,
        malpractice: malpractice,
        reporter: newReporter._id,
        source: "web",
        filename: supportingFileName,
        REF: generateUniqueREF(),
      });

      await newIssue.save();

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: null,
        activity: `New Issue created successfully.`,
        endpoint,
        userDetails: {
          userId: newReporter._id,
          model: "Reporter",
          name: `${newReporter.firstName} ${newReporter.lastName}`,
          role: newReporter.role,
        },
        dataInTransit: { email: newReporter.email },
      });

      // Send alert to admin
      try {
        await sendAlertToAdmin(browser, context, newIssue, newReporter);
        await recordAuditTrail({
          browser,
          ipAddress,
          deviceId: null,
          activity: `Admin alert sent successfully.`,
          endpoint,
          userDetails: {
            userId: newReporter._id,
            model: "Reporter",
            name: `${newReporter.firstName} ${newReporter.lastName}`,
            role: newReporter.role,
          },
          dataInTransit: { email: newReporter.email },
        });
      } catch (emailError) {
        // Don't fail the whole process if email fails
        await recordAuditTrail({
          browser,
          ipAddress,
          deviceId: null,
          activity: `Admin alert failed to send.`,
          endpoint,
          userDetails: {
            userId: newReporter._id,
            model: "Reporter",
            name: `${newReporter.firstName} ${newReporter.lastName}`,
            role: newReporter.role,
          },
          dataInTransit: { error: "Email sending error" },
        });
        console.error("Failed to send admin alert:", emailError);
      }

      // Alert reporter if they are not anonymous
      if (!isAnonymous) {
        try {
          await sendAlertToReporter(browser, context, newIssue, newReporter);
        } catch (error) {
          console.error("Failed to send alert to reporter:", error);
        }

        return {
          status: 201,
          message:
            "Issue submitted successfully. A confirmation message has been sent to you.",
          data: {
            personnel,
            malpractice,
            supportingFileName,
            newIssueId: newIssue._id,
          },
        };
      } else {
        // If the reporter is anonymous, we don't send any alerts
        return {
          status: 201,
          message:
            "Issue submitted successfully. As you have chosen to remain anonymous, please note that you will not receive any follow-up communication regarding this report.",
          data: {
            personnel,
            malpractice,
            supportingFileName,
            newIssueId: newIssue._id,
          },
        };
      }
    } catch (issueError) {
      console.error("Error creating issue:", issueError);
      logger.warn("Failed to create issue:", issueError);

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: null,
        activity: `Failed to create new issue.`,
        endpoint,
        userDetails: {
          userId: newReporter._id,
          model: "Reporter",
          name: `${newReporter.firstName} ${newReporter.lastName}`,
          role: newReporter.role,
        },
        dataInTransit: { email: newReporter.email },
      });
      return {
        status: 500,
        message: "Failed to submit issue",
        data: null,
      };
    }
  } catch (error) {
    console.error("Unexpected error in submitIssue:", error);
    logger.error("Unexpected error in submitIssue:", error);

    await recordAuditTrail({
      browser: "unknown",
      ipAddress,
      deviceId: null,
      activity: `Unexpected error in issue submission process.`,
      endpoint,
      userDetails: {
        userId: null,
        model: "Unknown",
        name: null,
        role: null,
      },
      dataInTransit: { error: "Unexpected system error" },
    });

    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}
