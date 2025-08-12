// controllers/registerController.ts
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Admin from "../../models/admin";
import logger from "@/lib/logger";
import { sendEmail } from "../../utils/sendEmail";

export async function signup(
  fullName: string,
  email: string,
  phoneNumber: string,
  password: string,
  confirmPassword: string
) {
  logger.info("Sign up for admin called", {
    fullName,
    email,
    phoneNumber,
  });

  await connectToDB();

  // 1) Ensure there is no existing admin at all
  const totalAdmins = await Admin.countDocuments();
  console.log(totalAdmins)
  if (totalAdmins >= 1) {
    logger.warn("Attempt to create a second admin blocked", {
      fullName,
      email,
      phoneNumber,
    });
    return NextResponse.json(
      {
        status: 403,
        message: "An admin account already exists. Only one admin is allowed.",
        data: [],
      },
      { status: 403 }
    );
  }

  // 2) Confirm password check
  if (password !== confirmPassword) {
    logger.warn("Password confirmation failed during admin signup", {
      email,
    });
    return NextResponse.json(
      {
        status: 400,
        message: "Password and confirm password do not match",
        data: [],
      },
      { status: 400 }
    );
  }

  // 3) Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5) Create admin
  const admin = new Admin({
    fullName,
    email,
    phoneNumber,
    password: hashedPassword,
  });
  await admin.save();

  logger.info("New Admin signed up successfully", {
    adminId: admin._id,
    fullName,
  });

  // 6) Send welcome email
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to MyCredit Whistleblower Portal!",
      html: `
      <!DOCTYPE html>
<html lang="en" style="font-family: 'Poppins', sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to the Whistleblower Portal - Admin Access</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom: 15px;">
            <img src="https://77bd89f3955b.ngrok-free.app/images/MyCredit-Logo.webp" alt="Whistleblower Portal Logo" style="height: 60px;" />
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="font-size: 20px; font-weight: bold; color: #333333; text-align: left; padding-bottom: 8px;">
            Welcome to the Whistleblower Portal!
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="font-size: 14px; color: #555555; line-height: 1.5; padding-bottom: 15px; text-align: left;">
            <p style="margin: 0 0 10px;">Hi ${fullName},</p>
            <p style="margin: 0 0 10px;">
              You have been granted <strong>administrator access</strong> to the Whistleblower Portal.  
              This secure role allows you to oversee report submissions and ensure  
              ethical standards are upheld.
            </p>
            <p style="margin: 0 0 10px;">
              As an Admin, you can:
            </p>
            <ul style="margin: 0 0 10px; padding-left: 18px; font-size: 14px; color: #555555; line-height: 1.5;">
              <li>View and review all submitted reports</li>
              <li>Track case progress and resolution timelines</li>
              <li>Communicate securely with whistleblowers</li>
              <li>Generate reports and analytics on portal activity</li>
            </ul>
            <p style="margin: 0;">
              Your responsibility is crucial in maintaining trust, transparency, and  
              confidentiality throughout the reporting process.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding-bottom: 20px;">
            <a href="https://whistleblower-portal.example.com/admin"
               style="
                 cursor: pointer;
                 background-color: #ffde17;
                 color: #1f2937;
                 text-decoration: none;
                 padding: 10px 20px;
                 border-radius: 6px;
                 font-weight: 600;
                 font-size: 14px;
                 display: inline-block;
                 box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                 transition: all 0.3s ease;
               "
               onmouseover="this.style.backgroundColor='#58595d'; this.style.color='#ffde17';"
               onmouseout="this.style.backgroundColor='#ffde17'; this.style.color='#1f2937';">
              Access the Admin Dashboard
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="font-size: 12px; color: #1f2937; text-align: center; padding-top: 8px; padding-bottom: 8px; line-height: 1.4;">
            &copy; 2025 Whistleblower Portal. All rights reserved.<br />
            <a 
              href="https://tierdata.co.ke" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="color: #1f2937; font-size: 12px; text-decoration: none; transition: color 0.2s;"
              onmouseover="this.style.color='#ffffff'" 
              onmouseout="this.style.color='#9ca3af'">
              Developed by: <strong style="color: #1f2937;">TIERDATA®</strong>
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

  </body>
</html>
      `,
    });
  } catch (err) {
    logger.error("Error sending welcome email", err);
  }

  return NextResponse.json(
    {
      status: 201,
      message: "Admin created successfully",
      // data: { id: admin._id },
      data: [],
    },
    { status: 201 }
  );
}
