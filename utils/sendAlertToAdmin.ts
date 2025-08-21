import { sendEmail } from "./sendEmail";
import logger from "@/lib/logger";
import Admin from "@/models/admin";
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
export async function sendAlertToAdmin(
  browser: string,
  context: Context,
  newIssue: Issue,
  newReporter: Reporter
): Promise<void> {
  logger.info("Preparing alert email for new issue submission");
  
  const { ipAddress, endpoint } = context;
  
  try {
    // Get admin email from the database
    const admin = await Admin.findOne();
    if (!admin?.email) {
      throw new Error("Admin email not found");
    }

    const subject = "New Issue Submitted to Whistleblower Portal";
    

const text = `Hello,

A new issue has been submitted to the whistleblower portal.
Details:
- **Issue REF:** ${newIssue.REF}
- **Type of Malpractice:** ${newIssue.malpractice.type}
- **Date Reported:** ${newIssue.createdAt.toISOString()}

Please log in to the portal to view and manage the issue:
https://mycredit.co.ke/admin/issues/${newIssue.REF}

Thank you,
The MyCredit Team`;

    await sendEmail({
      to: admin.email,
      subject,
      text,
    });
    
    logger.info(`Alert email successfully sent to admin: ${admin.email}`);

    // console.log(newReporter)


    await recordAuditTrail({
      browser,
      ipAddress,
      activity: "Alert email successfully sent to admin",
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
    logger.error("Failed to send alert email to admin", error);
    throw error;
  }
}