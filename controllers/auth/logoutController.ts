import { connectToDB } from "@/lib/db";
import { verifyAuthToken } from "../../utils/auth";
import Admin from "@/models/admin";
import logger from "@/lib/logger";
import { recordAuditTrail } from "@/utils/recordAuditTrail";

interface Context {
  browser: string;
  ipAddress: string;
  endpoint: string;
}
export async function logout(token: string, context: Context) {
  const { browser, ipAddress, endpoint } = context;

  try {
    // 1) Check if the token is valid
    const verified = await verifyAuthToken(token);

    // 2) If the token verification failed, propagate the failure response immediately
    if (verified.status !== 200) {
      logger.warn(`Logout failed: ${verified.message}`);

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: "",
        activity: `Logout attempt failed - ${verified.message}`,
        endpoint,
        userDetails: {
          userId: "null",
          model: "Admin",
          name: "",
          role: "",
        },
        dataInTransit: { tokenAttempted: token },
      });

      return {
        status: verified.status,
        message: verified.message,
        data: null,
      };
    }

    const decoded = verified.data;

    // --- Ensure DB connection is ready ---
    await connectToDB();

    // --- Find admin user by decoded token ID ---
    const admin = await Admin.findById(decoded?.id);
    if (!admin) {
      logger.warn(`Logout failed: admin not found.`);

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: "",
        activity: "Logout attempt failed - user not found",
        endpoint,
        userDetails: {
          userId: "decoded?.id",
          model: "Admin",
          name: "",
          role: "",
        },
        dataInTransit: {
          noData: "",
        },
      });

      return {
        status: 401,
        message: "Invalid token - user not found",
        data: null,
      };
    }
    // Capture state before logout for audit trail
    const beforeData = {
      sessionToken: admin.sessionToken,
      deviceId: admin.deviceId,
    };

    // Clear the session token and deviceId to effectively log out the user
    logger.info(
      `Logging out admin: ${admin.fullName} from device: ${admin.deviceId}`
    );
    admin.sessionToken = null;
    admin.deviceId = null;
    await admin.save();

    const afterData = {
      sessionToken: admin.sessionToken,
      deviceId: admin.deviceId,
    };

    // Record a successful logout audit trail
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId: beforeData.deviceId || "",
      activity: "Logout successful",
      endpoint,
      userDetails: {
        userId: admin._id,
        model: "Admin",
        name: admin.fullName,
        role: admin.role || "",
      },
      dataInTransit: {
        before: beforeData,
        after: afterData,
      },
    });

    // --- Return success response ---
    logger.info(
      `Admin: ${admin.fullName} successfully logged out. from device.`
    );
    return {
      status: 200,
      message: "Logout successful",
      data: null,
    };
  } catch (error) {
    // --- Log any verification or DB errors ---
    logger.error("Logout error", error);

    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId: "",
      activity: "Logout failed - internal server error",
      endpoint,
      userDetails: {
        userId: "null",
        model: "Admin",
        name: "",
        role: "",
      },
      dataInTransit: { error: "error" },
    });
    // --- Return generic internal server error to avoid info leaks ---
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}
