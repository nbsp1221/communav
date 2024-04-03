import { type RowDataPacket } from 'mysql2';
import { NextResponse, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1', 10);

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json({ message: 'Invalid limit value' }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
        SELECT *
        FROM everytime_articles
        WHERE id NOT IN (
          SELECT article_id
          FROM everytime_article_labels
        )
        ORDER BY RAND()
        LIMIT ?
      `,
      [limit]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'No unlabeled articles' }, { status: 404 });
    }

    return NextResponse.json(rows);
  }
  catch (error) {
    console.error('Error while fetching unlabeled articles:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
