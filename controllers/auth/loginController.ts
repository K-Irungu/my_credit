import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDB } from "@/lib/db";
import Admin from "@/models/admin";
import logger from "@/lib/logger";


export async function login(email: string, password: string) {
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
      return {
        status: 401,
        message: "Login failed: Invalid credentials",
        data: null,
      };
    }

    // 2) Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      logger.warn(`Login failed: wrong password (${email})`);
      return {
        status: 401,
        message: "Login failed: Invalid credentials",
        data: null,
      };
    }

    // 3) Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4) Save the token to the admin's sessionToken field
    admin.sessionToken = token;
    await admin.save();

    logger.info(`Login successful for admin: ${admin.fullName}`);

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
