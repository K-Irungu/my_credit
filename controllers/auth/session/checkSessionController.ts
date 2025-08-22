import { verifyAuthToken } from "../../../utils/auth";
import logger from "@/lib/logger";

export async function checkSession(token: string) {
  try {
    // 1) Check if the token is valid
    const verified = await verifyAuthToken(token);

    // 2) If the token verification failed, propagate the failure response immediately
    if (verified.status !== 200) {
      logger.warn(`Session check failed: ${verified.message}`);

      return {
        status: verified.status,
        message: verified.message,
        data: null,
      };
    }
    // 3) Return relevant user data (email, role) from the decoded token for session info
    logger.info(`Session validated for user: ${verified.data?.email}`);

    return {
      status: 200,
      message: "Session is valid",
      data: {
        email: verified.data?.email ?? null,
        role: verified.data?.role ?? null,
      },
    };
  } catch (error) {
    logger.error("Check session error:", error);
    return {
      status: 401,
      message: "Invalid or expired token",
      data: null,
    };
  }
}
