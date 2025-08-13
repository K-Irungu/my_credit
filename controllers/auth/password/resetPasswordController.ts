// /controllers/auth/resetPassword.ts
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import Admin, { IAdmin } from "@/models/admin";
import logger from "@/lib/logger";
import { recordAuditTrail } from "@/utils/recordAuditTrail";

// Define the context interface to get device and browser info
interface Context {
  browser: string;
  ipAddress: string;
  endpoint: string;
  deviceId: string;
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
  context: Context
) {
  const { browser, ipAddress, endpoint, deviceId } = context;

  try {
    await connectToDB();

    // Find the admin user by a token that exists and is valid
    // Note: Since the token is hashed, we need to iterate through all users with a token
    // to find a match. This is less efficient than also passing an email, but works.
    const adminsWithTokens: IAdmin[] = await Admin.find({
      resetPasswordToken: { $exists: true, $ne: null },
    });

    let admin: IAdmin | null = null;

    // Iterate through found admins to find the one whose token matches
    for (const a of adminsWithTokens) {
      if (a.resetPasswordToken) {
        const tokenIsValid = await bcrypt.compare(token, a.resetPasswordToken);
        if (tokenIsValid) {
          admin = a;
          break; // Exit the loop once a valid admin is found
        }
      }
    }

    // Handle case where admin is not found or token does not match
    if (!admin) {
      logger.warn(`Password reset failed: Invalid token provided.`);
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity: "Password reset failed - invalid link or user not found",
        endpoint,
        userDetails: {
          userId: "null",
          model: "Admin",
          name: "",
        },
        dataInTransit: { tokenProvided: token },
      });

      return {
        status: 400,
        message: "Invalid or expired password reset link.",
        data: null,
      };
    }

    // Check if the token has expired
    const tokenExpired =
      admin.resetPasswordExpires &&
      Date.now() > admin.resetPasswordExpires.getTime();

    if (tokenExpired) {
      logger.warn(
        `Password reset failed: Token expired for admin: ${admin.email}`
      );

      // Record a failed attempt
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity: "Password reset failed - token expired",
        endpoint,
        userDetails: {
          userId: "admin._id",
          model: "Admin",
          name: admin.fullName,
        },
        dataInTransit: { null: null },
      });

      // Clear the invalid token immediately to prevent further attempts
      admin.resetPasswordToken = "";
      admin.resetPasswordExpires = undefined;
      await admin.save();

      return {
        status: 400,
        message: "Invalid or expired password reset link.",
        data: null,
      };
    }

    // Hash the new password and update the admin document
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = newHashedPassword;
    admin.resetPasswordToken = "null"; // Clear the token to prevent reuse
    admin.resetPasswordExpires = undefined; // Clear the expiration time
    await admin.save();

    logger.info(`Password successfully reset for admin: ${admin.fullName}`);

    // Record a successful password reset
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId,
      activity: "Password successfully reset",
      endpoint,
      userDetails: {
        userId: "admin._id",
        model: "Admin",
        name: admin.fullName,
      },
      dataInTransit: { null: null },
    });

    return {
      status: 200,
      message: "Password reset successful.",
      data: null,
    };
  } catch (error) {
    logger.error("Reset password error", error);

    // Record audit trail for a system error
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId,
      activity: "Password reset failed - internal server error",
      endpoint,
      userDetails: {
        userId: "null",
        model: "Admin",
        name: "",
      },
      dataInTransit: { error: "error.message" },
    });

    return {
      status: 500,
      message: "Internal Server Error",
      data: null,
    };
  }
}
