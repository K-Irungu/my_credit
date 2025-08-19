// import jwt from "jsonwebtoken";
// import { connectToDB } from "@/lib/db";
// import Admin from "@/models/admin";
// import logger from "@/lib/logger";

// interface AdminTokenPayload {
//   id: string;
//   email: string;
//   role: string;
// }

// export async function regenerateSession(token: string) {
//   // --- Check for required environment variable ---
//   const secret = process.env.JWT_SECRET;

//   if (!secret) {
//     // Critical error: JWT secret missing, cannot proceed
//     throw new Error("JWT secret is not configured");
//   }

//   // --- Validate input token presence ---
//   if (!token) {
//     return {
//       status: 401,
//       message: "Token is required",
//       data: null,
//     };
//   }

//   try {
//     // --- Verify the provided JWT token ---
//     const decoded = jwt.verify(token, secret) as AdminTokenPayload;

//     // --- Ensure DB connection is ready ---
//     await connectToDB();

//     // --- Find admin user by decoded token ID ---
//     const admin = await Admin.findById(decoded.id);
//     if (!admin) {
//       // Log and return failure if user is not found
//       logger.warn(`Regenerate session failed: admin not found.`);
//       return {
//         status: 401,
//         message: "Invalid token - user not found",
//         data: null,
//       };
//     }

//     // Create a new JWT token with fresh expiry
//     const newToken = jwt.sign(
//       { id: admin._id.toString(), email: admin.email, role: "admin" },
//       secret,
//       { expiresIn: "1h" }
//     );

//     // --- Update user's session token in DB to keep sessions in sync ---
//     admin.sessionToken = newToken;
//     await admin.save();

//     // --- Log successful regeneration for audit ---
//     logger.info(
//       `Session regenerated successfully for admin id: ${admin._id.toString()}`
//     );

//     // --- Return success response with updated session info ---
//     return {
//       status: 200,
//       message: "Session regenerated successfully",
//       data: {
//         fullName: admin.fullName,
//         token: newToken,
//       },
//     };
//   } catch (error) {
//     // --- Log any verification or DB errors ---
//     logger.error("Regenerate session error", error);

//     // --- Return generic unauthorized error to avoid info leaks ---
//     return {
//       status: 401,
//       message: "Invalid or expired token",
//       data: null,
//     };
//   }
// }
