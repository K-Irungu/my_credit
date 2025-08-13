import { sendEmail } from "./sendEmail"; // Assuming the path to your sendEmail utility
import logger from "@/lib/logger";

/**
 * @name sendResetPasswordEmail
 * @description Sends a password reset email to a user.
 * @param email The recipient's email address.
 * @param resetUrl The unique password reset URL to be included in the email.
 */
export async function sendResetPasswordEmail(email: string, resetUrl: string): Promise<void> {
  logger.info(`Preparing password reset email for: ${email}`);

  const subject = "Password Reset Request for Your Account";
  
  // You can use a more sophisticated HTML template here
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Hello,</p>
      <p>You recently requested to reset the password for your account.</p>
      <p>Please click on the button below to reset your password:</p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </p>
      <p>If you did not request a password reset, please ignore this email. This link is only valid for one hour.</p>
      <p>Thank you,</p>
      <p>The [Your App Name] Team</p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject,
      html,
    });
    logger.info(`Password reset email successfully sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}`, error);
    throw error;
  }
}