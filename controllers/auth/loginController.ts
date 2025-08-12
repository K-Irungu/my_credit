import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDB } from "@/lib/db";
import Admin from "@/models/admin";
import logger from "@/lib/logger";
import { recordAuditTrail } from "@/utils/recordAuditTrail"; // import your utility

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
  // console.log(email);
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  try {
    await connectToDB();

    // 1) Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      logger.warn(`Login failed: admin not found (${email})`);

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity: "Login attempt failed - admin not found",
        endpoint,
        userDetails: {
          userId: "null",
          model: "Admin",
          name: "",
          role: "",
        },
        dataInTransit: { emailAttempted: email },
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
      logger.warn(`Login failed: wrong password (${email})`);

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity: "Login attempt failed - wrong password",
        endpoint,
        userDetails: {
          userId: admin._id,
          model: "Admin",
          name: admin.fullName,
          role: admin.role || "",
        },
        dataInTransit: { attemptedEmail: email },
      });

      return {
        status: 401,
        message: "Login failed: Invalid credentials",
        data: null,
      };
    }

    // 3) Check if logged in on a different device
    if (admin.sessionToken && admin.deviceId && admin.deviceId !== deviceId) {
      logger.warn(`Login attempt on different device for admin: ${email}`);

      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity: "Login attempt denied - already logged in on another device",
        endpoint,
        userDetails: {
          userId: admin._id,
          model: "Admin",
          name: admin.fullName,
          role: admin.role || "",
        },
        dataInTransit: {
          attemptedDeviceId: deviceId,
          currentDeviceId: admin.deviceId,
        },
      });

      return {
        status: 403,
        message: "You are already logged in on another device.",
        data: null,
      };
    }

    // 4) Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5) Previous session token and deviceId
    const beforeData = {
      sessionToken: admin.sessionToken,
      deviceId: admin.deviceId,
      lastLogin: admin.lastLogin,
    };

    // 6) Update session token and deviceId
    admin.lastLogin = new Date();
    admin.sessionToken = token;
    admin.deviceId = deviceId;

    await admin.save();

    logger.info(
      `Login successful for admin: ${admin.fullName} on device: ${deviceId}`
    );

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
        role: admin.role || "",
      },
      dataInTransit: {
        before: beforeData,
        after: {
          sessionToken: admin.sessionToken,
          deviceId: admin.deviceId,
          lastLogin: admin.lastLogin,
        },
      },
    });

    return {
      status: 200,
      message: "Login successful.",
      data: { fullName: admin.fullName, token },
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
