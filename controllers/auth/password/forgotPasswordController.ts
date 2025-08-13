// /controllers/auth/forgotPassword.ts
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import Admin, { IAdmin } from "@/models/admin";
import logger from "@/lib/logger";
import { recordAuditTrail } from "@/utils/recordAuditTrail";
import { sendResetPasswordEmail } from "@/utils/sendResetPasswordEmail"; // Assuming you have an email utility

// Define the context interface to get device and browser info
interface Context {
  browser: string;
  ipAddress: string;
  endpoint: string;
}

export async function forgotPassword(
  email: string,
  deviceId: string,
  context: Context
) {
  const { browser, ipAddress, endpoint } = context;

  try {
    await connectToDB();

    // 1) Find admin by email
    const admin: IAdmin | null = await Admin.findOne({ email });

    // 2) Handle user not found securely.
    // We return a generic success message to prevent attackers from knowing which emails exist.
    if (!admin) {
      logger.info(`Forgot password request for non-existent email: ${email}`);

      // Record a generic audit trail to avoid revealing user existence
      await recordAuditTrail({
        browser,
        ipAddress,
        deviceId,
        activity: "Forgot password request processed for non-existent email",
        endpoint,
        userDetails: {
          userId: "null",
          model: "Admin",
          name: "",
        },
        dataInTransit: { emailAttempted: email },
      });
      
      return {
        status: 200,
        message: "If an account with that email exists, a password reset link has been sent.",
        data: null,
      };
    }

    // 3) Generate a unique, secure, and time-limited token.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // Token expires in 1 hour

    // 4) Hash the token before saving it to the database
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // 5) Save the hashed token and expiration time to the admin document
    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = resetTokenExpires;
    await admin.save();

    // 6) Construct the password reset link with the unhashed token
    const resetLink = `${process.env.APP_URL}/auth/resetPassword?token=${resetToken}&email=${email}`;
    
    // 7) Send the password reset email
    // NOTE: Uncomment the following line and implement your email service.
    await sendResetPasswordEmail(admin.email, resetLink);
    logger.info(`Password reset link sent to admin: ${admin.fullName}`);
    logger.info(`Reset link: ${resetLink}`); // For debugging purposes

    // 8) Record a successful audit trail
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId,
      activity: "Forgot password request processed successfully",
      endpoint,
      userDetails: {
        userId: "admin._id",
        model: "Admin",
        name: admin.fullName,
      },
      dataInTransit: {
        resetTokenExpires: resetTokenExpires,
      },
    });

    return {
      status: 200,
      message: "If an account with that email exists, a password reset link has been sent.",
      data: null,
    };

  } catch (error) {
    logger.error(`Forgot password error for email ${email}:`, error);

    // Record audit trail for a system error
    await recordAuditTrail({
      browser,
      ipAddress,
      deviceId,
      activity: "Forgot password failed - internal server error",
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
