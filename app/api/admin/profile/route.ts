import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Admin from "@/models/admin";

export async function GET() {
  try {
    await connectToDB();
    const admin = await Admin.findOne(); // adjust logic if needed
    return NextResponse.json({ name: admin?.fullName || "Admin" });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json({ error: "Failed to fetch admin" }, { status: 500 });
  }
}
