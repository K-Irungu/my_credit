// import { NextRequest, NextResponse } from "next/server";
// import {connectToDB} from "@/lib/db"; // your DB connection utility
// import Session from "@/models/session";  // your Mongoose session model

// export async function authMiddleware(req: NextRequest) {
//   // Get session ID from cookies
//   const sessionId = req.cookies.get("session")?.value;

//   if (!sessionId) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   try {
//     await connectToDB();

//     // Check if session exists in DB
//     const session = await Session.findById(sessionId).populate("userId");

//     if (!session) {
//       // Session deleted or invalid → clear cookie
//       const res = NextResponse.redirect(new URL("/login", req.url));
//       res.cookies.set("sessionId", "", { path: "/", expires: new Date(0) });
//       return res;
//     }

//     // Optional: check expiration
//     if (session.expiresAt && session.expiresAt < new Date()) {
//       await Session.findByIdAndDelete(sessionId);
//       const res = NextResponse.redirect(new URL("/login", req.url));
//       res.cookies.set("sessionId", "", { path: "/", expires: new Date(0) });
//       return res;
//     }

//     // Attach user info via request headers (for serverless compatibility)
//     req.headers.set("x-user-id", session.userId.toString());
//     req.headers.set("x-user-role", session.userId.role);

//     // Continue
//     return NextResponse.next();
//   } catch (err) {
//     console.error("Auth middleware error:", err);
//     const res = NextResponse.redirect(new URL("/login", req.url));
//     res.cookies.set("sessionId", "", { path: "/", expires: new Date(0) });
//     return res;
//   }
// }
