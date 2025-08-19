import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import MongoDBAdapter  from "@auth/mongodb-adapter";
import { connectToDB } from "@/lib/db"; // Correctly import your function

// Connect to the database
connectToDB();

const handler = NextAuth({
  // adapter: MongoDBAdapter(connectToDB()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

  ],
});

export { handler as GET, handler as POST };
