import Reporter from "@/models/reporter";
import { connectToDB } from "@/lib/db";
import logger from "@/lib/logger";
import { recordAuditTrail } from "@/utils/recordAuditTrail";

interface Context {
  ipAddress: string;
  endpoint: string;
}

interface CreateReporterBody {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  company: string | null;
  role: string | null;
  requiresFeedback: boolean;
  REF: string; // The unique reference field
  isAnonymous: boolean;
}

export async function createReporter(
  createReporterBody: CreateReporterBody,
  context: Context,
  browser: string
): Promise<any> {
  const { ipAddress, endpoint } = context;
  
  logger.info("Starting reporter creation process", {
    email: createReporterBody.email,
    endpoint,
    ipAddress
  });


  console.log("Creating reporter:", createReporterBody);

  try {
    await connectToDB();


      // Create new reporter
      const newReporter = new Reporter({
        firstName: createReporterBody.firstName,
        lastName: createReporterBody.lastName,
        email: createReporterBody.email,
        phoneNumber: createReporterBody.phoneNumber,
        company: createReporterBody.company,
        role: createReporterBody.role,
        requiresFeedback: createReporterBody.requiresFeedback,
        REF: createReporterBody.REF,
        isAnonymous: createReporterBody.isAnonymous,
      });

      const savedReporter = await newReporter.save();
      
      logger.info("New reporter created successfully", {
        reporterId: savedReporter._id,
        reporterREF: savedReporter.REF,
        email: savedReporter.email,
        isAnonymous: savedReporter.isAnonymous
      });

      // Record audit trail for reporter creation
      await recordAuditTrail({
        browser: browser, 
        ipAddress,
        activity: "New reporter created",
        deviceId: null,
        endpoint,
        userDetails: {
          userId: savedReporter._id,
          model: "Reporter",
          name: `${savedReporter.firstName} ${savedReporter.lastName}`,
          role: savedReporter.role,
        },
        dataInTransit: { 
          action: "create",
          reporterREF: savedReporter.REF 
        },
      });

      return {
        _id: savedReporter._id,
        firstName: savedReporter.firstName,
        lastName: savedReporter.lastName,
        email: savedReporter.email,
        phoneNumber: savedReporter.phoneNumber,
        company: savedReporter.company,
        role: savedReporter.role,
        requiresFeedback: savedReporter.requiresFeedback,
        REF: savedReporter.REF,
        isExisting: false
      };

  } catch (error: any) {
    logger.error("Failed to create/update reporter", {
      error: error.message,
      stack: error.stack,
      email: createReporterBody.email,
      endpoint,
      ipAddress
    });

    // Record audit trail for failed reporter creation
    try {
      await recordAuditTrail({
        browser: "server",
        ipAddress,
        activity: "Reporter creation failed",
        deviceId: null,
        endpoint,
        userDetails: {
          userId: null,
          model: "Reporter",
          name: `${createReporterBody.firstName} ${createReporterBody.lastName}`,
          role: createReporterBody.role,
        },
        dataInTransit: { 
          error: error.message,
          email: createReporterBody.email,
          errorType: error.constructor.name 
        },
      });
    } catch (auditError) {
      logger.error("Failed to record audit trail for reporter creation failure", {
        originalError: error.message,
        auditError: auditError
      });
    }

    throw new Error(`Failed to create/update reporter: ${error.message}`);
  }
}

