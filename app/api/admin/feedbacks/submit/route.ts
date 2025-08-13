// app/api/admin/feedbacks/submit/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const feedbackData = await req.json();
    
    // --- Your logic to process and save the feedback goes here ---
    // Example: save to a database, send an email, etc.
    console.log('Received feedback:', feedbackData);
    
    // Return a success response
    return NextResponse.json({ message: 'Feedback submitted successfully' }, { status: 201 });
    
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
