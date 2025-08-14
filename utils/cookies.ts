import { cookies } from "next/headers";

// --- Set a secure HTTP-only session cookie ---
// Stores the raw sessionId (NOT hashed) on the client
// Expiry is matched to the server-side session expiry
// Flags:
//  - httpOnly: prevents JavaScript access (XSS protection)
//  - secure: only send over HTTPS
//  - sameSite=lax: protects against CSRF while allowing basic navigation
//  - path="/": makes cookie available to all routes
export async function setSessionCookie(sessionId: string, expiresAt: Date) {
  const cookieStore = await cookies(); // <- await it

  cookieStore.set({
    name: "session", // cookie name
    value: sessionId, // raw session token for client
    httpOnly: true, // prevent access from client-side JS
    secure: true, // only send over HTTPS
    sameSite: "lax", // CSRF protection setting
    path: "/", // accessible throughout the app
    expires: expiresAt, // expiration date
  });
}

// --- Clear the session cookie ---
// Sets value to empty string and expiration date in the past
// This prompts the browser to delete the cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies(); // <- await it

  cookieStore.set({
    name: "session",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // epoch time → instantly expired
  });
}
