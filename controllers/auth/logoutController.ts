import { connectToDB } from "@/lib/db";
import { verifyAuthToken } from "../../utils/auth";
import Admin from "@/models/admin";
import logger from "@/lib/logger";

export async function logout(token: string) {
  try {
    // 1) Check if the token is valid
    const verified = await verifyAuthToken(token);

    // 2) If the token verification failed, propagate the failure response immediately
    if (verified.status !== 200) {
      logger.warn(`Logout failed: ${verified.message}`);
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
      return {
        status: 401,
        message: "Invalid token - user not found",
        data: null,
      };
    }

    // Clear the session token and deviceId to effectively log out the user
    logger.info(`Logging out admin: ${admin.fullName} from device: ${admin.deviceId}`);
    admin.sessionToken = null;
    admin.deviceId = null
    await admin.save();
    
    
    // --- Return success response ---
    logger.info(`Admin: ${admin.fullName} successfully logged out. from device.`);
    return {
      status: 200,
      message: "Logout successful",
      data: null,
    };
  } catch (error) {
    // --- Log any verification or DB errors ---
    logger.error("Logout error", error);

    // --- Return generic internal server error to avoid info leaks ---
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}
