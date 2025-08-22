import bcrypt from "bcryptjs";
import Admin from "@/models/admin";
import logger from "@/lib/logger";
import { connectToDB } from "@/lib/db";
import { recordAuditTrail } from "@/utils/recordAuditTrail";
import { createSession, findActiveSessionForUser } from "@/utils/session";
import { setSessionCookie } from "@/utils/cookies";

interface Context {
  browser: string;
  ipAddress: string;
  endpoint: string;
}

export async function login(
  email: string,
  password: string,
  deviceId: string,
  context: Context
) {
  const { browser, ipAddress, endpoint } = context;

  try {
    await connectToDB();

    // 1) Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      logger.warn(
        `Failed login attempt: Admin with email: (${email}) not found.`
      );
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: null,
        activity: `Failed login attempt: Admin with email: (${email}) not found.`,
        endpoint,
        userDetails: {
          userId: null,
          model: "Unknown",
          name: null,
          role: null,
        },
        dataInTransit: { emailEntered: email },
      });
      return {
        status: 401,
        message: "Login failed: Invalid credentials",
        data: null,
      };
    }

    // 2) Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      logger.warn(`Login failed: wrong password for: (${email})`);
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId: null,
        activity: `Login failed: wrong password for: (${email})`,
        endpoint,
        userDetails: {
          userId: admin._id,
          model: "Admin",
          name: admin.fullName,
          role: admin.role,
        },
        dataInTransit: { enteredEmail: email },
      });
      return {
        status: 401,
        message: "Login failed: Invalid credentials",
        data: null,
      };
    }

    // // 3) Check for active session
    // const existing = await findActiveSessionForUser(admin._id.toString());
    // if (existing) {
    //   logger.warn("Login attempt denied - already logged in on another device");
    //   await recordAuditTrail({
    //     browser,
    //     ipAddress,
    //     deviceId,
    //     activity: "Login attempt denied - already logged in on another device",
    //     endpoint,
    //     userDetails: {
    //       userId: admin._id,
    //       model: "Admin",
    //       name: admin.fullName,
    //       role: admin.role,
    //     },
    //     dataInTransit: {
    //       attemptedDeviceId: deviceId,
    //       currentDeviceId: existing.deviceId,
    //     },
    //   });
    //   return {
    //     status: 403,
    //     message: "You are already logged in on another device.",
    //     data: null,
    //   };
    // }

    // 4) Create new session
    const { sessionId, expiresAt } = await createSession({
      userId: admin._id.toString(),
      deviceId: deviceId ?? null,
      userAgent: browser,
      ipAddress,
    });
    setSessionCookie(sessionId, expiresAt);

    admin.lastLogin = new Date();
    await admin.save();

    logger.info(`Admin ${admin.fullName} successfully logged in`);
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId,
      activity: "Login successful",
      endpoint,
      userDetails: {
        userId: admin._id,
        model: "Admin",
        name: admin.fullName,
        role: admin.role,
      },
      dataInTransit: { sessionExpiresAt: expiresAt },
    });

    return {
      status: 200,
      message: "Login successful.",
      data: { fullName: admin.fullName },
    };
  } catch (error) {
    logger.error("Login error", error);
    return {
      status: 500,
      message: "Internal Server Error",
      data: null,
    };
  }
}
