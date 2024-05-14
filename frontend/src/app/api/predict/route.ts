import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ message: 'Query parameter is missing' }, { status: 400 });
    }

    const response = await fetch(`http://localhost:8000/agent?query=${query}`);
    const data = await response.json();

    return NextResponse.json(data);
  }
  catch (error) {
    console.error('Error while fetching prediction:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
