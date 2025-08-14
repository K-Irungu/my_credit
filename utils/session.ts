import crypto from "crypto";
import Session from "@/models/session";

// --- Session configuration constants ---
export const SESSION_COOKIE = "session"; 
export const SESSION_LIFETIME_MS = 60 * 60 * 1000; 

// --- Helper: Generate a secure random session ID ---
function randomSessionId() {
  return crypto.randomBytes(32).toString("base64url");
}

// --- Helper: Hash a session ID with SHA-256 ---
function hashSessionId(id: string) {
  return crypto.createHash("sha256").update(id).digest("hex");
}

// --- Find an active session for a specific user ---
// Used to check if a user is already logged in
// Only returns sessions that are not revoked and have not expired
export async function findActiveSessionForUser(userId: string) {
  const now = new Date();
  return Session.findOne({
    userId,
    revokedAt: null,
    expiresAt: { $gt: now },
  });
}

// --- Create a new session for a user ---
// 1) Generates a random session ID (token for client)
// 2) Hashes it for secure storage
// 3) Calculates expiration time
// 4) Stores session in DB with device, user agent, and IP info
// Returns raw sessionId (to give to client) and expiry time
export async function createSession(params: {
  userId: string; 
  deviceId: string | null;
  userAgent: string;
  ipAddress: string;
}) {
  const sessionId = randomSessionId();
  const sessionHash = hashSessionId(sessionId);
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

  await Session.create({
    userId: params.userId,
    sessionHash,
    deviceId: params.deviceId ?? null,
    userAgent: params.userAgent ?? "",
    ipAddress: params.ipAddress ?? "",
    expiresAt,
  });

  return { sessionId, expiresAt };
}

// --- Revoke (logout) a specific session by ID ---
// Hashes provided session ID to match DB storage
// Sets revokedAt to current time so it can't be used again
export async function revokeSessionById(sessionId: string) {
  const sessionHash = hashSessionId(sessionId);
  await Session.updateOne(
    { sessionHash, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

// --- Retrieve an active session from a cookie value ---
// 1) Returns null if cookie missing
// 2) Hashes cookie session ID
// 3) Finds session in DB that's not revoked and not expired
export async function getSessionFromCookie(sessionIdCookie?: string | null) {
  if (!sessionIdCookie) return null;
  const sessionHash = hashSessionId(sessionIdCookie);
  const now = new Date();
  const session = await Session.findOne({
    sessionHash,
    revokedAt: null,
    expiresAt: { $gt: now },
  });
  return session;
}
