// app/api/admin/file/list/route.ts

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Your logic to fetch the list of files goes here
  // For example, you might read files from a directory, a database, or cloud storage
  
  const files = [
    { id: 1, name: 'document1.pdf', size: '1.2 MB' },
    { id: 2, name: 'image.jpg', size: '500 KB' },
  ];

  return NextResponse.json(files);
}