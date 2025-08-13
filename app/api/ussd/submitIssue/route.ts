// app/api/ussd/submitIssue/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const ussdData = await req.text(); // USSD data is often sent as plain text or form data
    
    // --- Your logic to parse the USSD data and submit the issue goes here ---
    // Example: parse the text to extract a user's phone number and issue description.
    console.log('Received USSD data:', ussdData);
    
    // Return a success response, which might be a USSD menu response
    const responseText = "END Thank you for submitting your issue.";
    return new NextResponse(responseText, { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error submitting USSD issue:', error);
    const errorText = "END We could not process your request. Please try again.";
    return new NextResponse(errorText, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
}