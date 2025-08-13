// app/api/admin/issues/list/route.ts

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Your logic to fetch the list of issues goes here
  // For example, you might retrieve issues from a database
  
  const issues = [
    { id: 1, title: 'Login button is not working', status: 'Open' },
    { id: 2, title: 'Incorrect data on dashboard', status: 'In Progress' },
  ];

  return NextResponse.json(issues);
}