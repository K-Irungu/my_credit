
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Issue from "@/models/issue";

export const getAllIssues = async () => {
  try {
    // Connect to the database
    await connectToDB();

    // Fetch all issues from the database
    const issues = await Issue.find({}).lean();

    return {
      ok: true,
      issues: issues
    };
  } catch (error) {
    console.error('Error fetching issues from database:', error);
    return {
      ok: false,
      message: 'Failed to fetch issues from the database.'
    };
  }
};
