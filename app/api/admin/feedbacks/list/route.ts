// app/api/admin/feedbacks/list/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  // Your logic to fetch feedbacks goes here
  const feedbacks = [{ id: 1, message: 'Example feedback' }]; 
  
  return NextResponse.json(feedbacks);
}