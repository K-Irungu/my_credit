import jwt, { JwtPayload } from "jsonwebtoken";
import Admin from "@/models/admin";
import { connectToDB } from "@/lib/db";

interface AdminTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function verifyAuthToken(token: string) {
  // --- Input Validation ---
  if (!token) {
    return {
      status: 401,
      message: "Token is required",
      data: null,
    };
  }

  // --- Environment Variable Check ---
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return {
      status: 500,
      message: "JWT secret is not configured",
      data: null,
    };
  }

  try {
    // --- Token Verification ---
    const decoded = jwt.verify(token, secret) as AdminTokenPayload;

    // --- Database Connection ---
    await connectToDB();

    // --- Admin Lookup ---
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return {
        status: 401,
        message: "Admin not found",
        data: null,
      };
    }

    // --- Session Token Validation ---
    if (!decoded || admin.sessionToken !== token) {
      return {
        status: 401,
        message: "Invalid session token",
        data: null,
      };
    }

    // --- Success ---
    return {
      status: 200,
      message: "Session is valid",
      data: decoded,
    };
  } catch (error) {
    // --- Error Handling ---
    console.error("verifyAuthToken error:", error);
    return {
      status: 401,
      message: "Invalid or expired token",
      data: null,
    };
  }
}
