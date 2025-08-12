// utils/recordAuditTrail.ts
import mongoose from "mongoose";
import AuditTrail from "@/models/auditTrail";
import logger from "@/lib/logger"; // make sure you import your logger at the top

interface UserDetails {
  userId: mongoose.Types.ObjectId | string;
  model: "Admin" | "Reporter";
  name?: string;
  role?: string;
}

interface RecordAuditProps {
  browser: string;
  ipAddress: string;
  deviceId: string;
  activity: string;
  endpoint: string;
  userDetails: UserDetails;
  dataInTransit?: Record<string, any>;  // any key-value pairs, optional
  timestamp?: Date; // Optional, defaults to now
}

/**
 * Records an audit trail entry to the database.
 * Logs any errors internally but does not throw.
 */
export async function recordAuditTrail({
  browser,
  ipAddress,
  deviceId,
  activity,
  endpoint,
  userDetails,
  dataInTransit,
  timestamp = new Date(),
}: RecordAuditProps) {
  try {
    await AuditTrail.create({
      browser,
      ipAddress,
      deviceId,
      activity,
      endpoint,
      userDetails,
      dataInTransit,
      timestamp,
    });
  } catch (error) {
    logger.error("Failed to record audit trail:", error);
  }
}
