import { type RowDataPacket } from 'mysql2';
import { type NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        category_id,
        COUNT(*) AS count
      FROM (
        SELECT * FROM article_predictions
      ) AS predictions
      GROUP BY category_id
    `);

    const articleCounts = rows.reduce((prevValue, row) => {
      prevValue[row.category_id] = row.count;
      return prevValue;
    }, {} as Record<number, number>);

    return NextResponse.json(articleCounts);
  }
  catch (error) {
    console.error('Error while fetching articles statistics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
