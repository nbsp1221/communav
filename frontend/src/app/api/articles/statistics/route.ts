import { type RowDataPacket } from 'mysql2';
import { type NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        category_ids,
        COUNT(*) AS count
      FROM (
        SELECT
          article_id,
          JSON_EXTRACT(category_ids, '$[*]') AS category_ids
        FROM everytime_article_labels
      ) AS labeled_articles
      GROUP BY category_ids
    `);

    const articlesCount = rows.reduce((prevValue, row) => {
      if (row.category_ids === null) {
        prevValue['0'] = row.count;
      }
      else {
        row.category_ids.forEach((categoryId: number) => {
          prevValue[categoryId] = (prevValue[categoryId] || 0) + row.count;
        });
      }

      return prevValue;
    }, {} as Record<string, number>);

    return NextResponse.json(articlesCount);
  }
  catch (error) {
    console.error('Error while fetching articles statistics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
