import { sendEmail } from "./sendEmail";
// import { sendSMS } from "./sendSMS"
import logger from "@/lib/logger";
import Reporter from "@/models/reporter";
import { Types } from "mongoose";
import { recordAuditTrail } from "./recordAuditTrail";

interface Context {
  ipAddress: string;
  endpoint: string;
}

// Interface for the Reporter model
interface Reporter {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company: string | null;
  role: string | null;
  requiresFeedback: boolean;
  REF: string;
  isAnonymous: boolean;
}

// Interface for the ImplicatedPersonnel data
interface ImplicatedPersonnel {
  firstName: string;
  lastName: string;
  companyLocation: string;
  rolePosition: string;
  phoneNumber: string;
}

// Interface for the Malpractice data
interface Malpractice {
  type: string;
  location: string;
  description: string;
  isOngoing: string;
}

// Interface for the Issue model
export interface Issue {
  _id: Types.ObjectId;
  implicatedPersonel: ImplicatedPersonnel;
  malpractice: Malpractice;
  reporter: Types.ObjectId; // A reference to the Reporter document
  source: string;
  filename: string | null;
  REF: string;
  ipAddress: string;
  endpoint: string;
  createdAt: Date;
  updatedAt: Date;
}
export async function sendAlertToReporter(
  browser: string,
  context: Context,
  newIssue: Issue,
  newReporter: Reporter
): Promise<void> {
  logger.info("Preparing alert email for new issue submission by REPORTER");

  const { ipAddress, endpoint } = context;


    try {

      const subject = `Confirmation of Your Whistleblower Report Submission (REF: ${newIssue.REF})`;

      const text = `Hello,

Thank you for your courage and integrity in submitting a report through the MyCredit Whistleblower Portal. We have successfully received the following information:

Your Report Reference Number: ${newIssue.REF}
Type of Malpractice Reported: ${newIssue.malpractice.type}
Date & Time Submitted: ${newIssue.createdAt.toLocaleString()}

Your report will be handled with the strictest confidentiality. Our dedicated team will now review the details you have provided. If necessary, we may contact you for further information.

Your Reference Number: ${newIssue.REF}

We appreciate your commitment to helping uphold ethics and integrity at MyCredit.

Sincerely,
The MyCredit Whistleblower Team`;

      await sendEmail({
        to: newReporter.email,
        subject,
        text,
      });

      logger.info(
        `Alert email successfully sent to reporter: ${newReporter.email}`
      );

      //Send SMS alert to phoneNumber
      // await sendSMS({

      // }) 




      await recordAuditTrail({
        browser,
        ipAddress,
        activity: "Alert email successfully sent to reporter",
        deviceId: null,
        endpoint,
        userDetails: {
          userId: newReporter._id,
          model: "Reporter",
          name: `${newReporter.firstName} ${newReporter.lastName}`,
          role: newReporter.role,
        },
        dataInTransit: { emailContent: text },
      });
    } catch (error) {
      logger.error("Failed to send alert email to reporter", error);
      throw error;
    }
  }
