import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import Admin from "@/models/admin";
import { connectToDB } from "@/lib/db";

interface AdminTokenPayload {
  id: string;
  email: string;
  role: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret) as AdminTokenPayload;

    await connectToDB();

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    if (!decoded || admin.sessionToken !== token) {
      return res.status(401).json({ message: "Invalid session token" });
    }

    (req as any).admin = admin;
    console.log("Admin set on req:", (req as any).admin);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
