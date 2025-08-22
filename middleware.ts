// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // The session ID exists, so we let the request continue.
  // The server component or API route will perform the database validation.
  return NextResponse.next();
}

export const config = {
  // Specify the paths this middleware should protect.
  matcher: ["/api/admin/:path*", "/admin/:path*"]
  // matcher: "/admin/:path*"
};