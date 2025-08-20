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
}

export async function sendAlertToAdmin(
  browser: string,
  context: Context,
  reporter: Reporter
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
    
    // Plain text email content
    const text = `Hello,

A new issue has been submitted to the whistleblower portal.

Please log in to the portal to view and manage the issue.

Thank you,
The MyCredit Team`;

    await sendEmail({
      to: admin.email,
      subject,
      text,
    });
    
    logger.info(`Alert email successfully sent to admin: ${admin.email}`);

    await recordAuditTrail({
      browser,
      ipAddress,
      activity: "Alert email successfully sent to admin",
      deviceId: null,
      endpoint,
      userDetails: {
        userId: reporter._id,
        model: "Reporter",
        name: `${reporter.firstName} ${reporter.lastName}`,
        role: reporter.role,
      },
      dataInTransit: { emailContent: text },
    });
  } catch (error) {
    logger.error("Failed to send alert email to admin", error);
    throw error;
  }
}