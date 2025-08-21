// controllers/auth/logoutController.ts
import { cookies } from "next/headers";
import { revokeSessionById, hashSessionId } from "@/utils/session";
import { clearSessionCookie } from "@/utils/cookies";
import logger from "@/lib/logger";
import { recordAuditTrail } from "@/utils/recordAuditTrail";
import { connectToDB } from "@/lib/db";
import Session from "@/models/session";
import crypto from "crypto";


interface Context {
  browser: string;
  ipAddress: string;
  endpoint: string;
}

export async function logout(deviceId: string, context: Context) {
  const { browser, ipAddress, endpoint } = context;

  try {
    await connectToDB();

    // --- Get session ID from cookies ---
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      logger.warn("Logout failed: No session found in cookies");
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity: "Logout failed - no session in cookies",
        endpoint,
        userDetails: {
          userId: null,
          model: "Unknown",
          name: null,
          role: null,
        },
        dataInTransit: { revokedSessionId: null },
      });
      return { status: 401, message: "No active session", data: null };
    }

    // --- Look up session in DB by hash ---
    const hashedSessionId = hashSessionId(sessionId)

    const session = await Session.findOne({
      sessionHash: hashedSessionId,
    }).populate("userId", "fullName role _id");


    if (!session) {
      logger.warn("Logout failed: Session cookie present but no DB record");
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity:
          "Logout failed - session cookie present but no matching DB record",
        endpoint,
        userDetails: {
          userId: "unknown",
          model: "Admin",
          name: "",
          role: "",
        },
        dataInTransit: { sessionIdInCookies: sessionId },
      });
      return { status: 401, message: "Invalid session", data: null };
    }

    const admin = session.userId as {
      _id: string;
      fullName: string;
      role: string;
    };

    // --- Revoke session & clear cookie ---
    await revokeSessionById(sessionId);
    clearSessionCookie();

    // --- Audit: Successful logout ---
    logger.info(`Admin ${admin.fullName} successfully logged out`);
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId: session.deviceId || "",
      activity: "Logout successful",
      endpoint,
      userDetails: {
        userId: admin._id,
        model: "Admin",
        name: admin.fullName,
        role: admin.role,
      },
      dataInTransit: { revokedSessionId: sessionId },
    });

    return { status: 200, message: "Logged out successfully", data: null };
  } catch (error) {
    logger.error("Logout error", error);
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId: "",
      activity: "Logout failed - internal server error",
      endpoint,
      userDetails: {
        userId: "unknown",
        model: "Admin",
        name: "",
        role: "",
      },
      dataInTransit: { error: "error" },
    });
    return { status: 500, message: "Internal server error", data: null };
  }
}
