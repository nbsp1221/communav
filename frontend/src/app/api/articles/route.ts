import { type RowDataPacket } from 'mysql2';
import { type NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryIds = JSON.parse(searchParams.get('categoryIds') || '[]');
    const start = parseInt(searchParams.get('start') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (isNaN(start) || start < 0) {
      return NextResponse.json({ message: 'Invalid start value' }, { status: 400 });
    }

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json({ message: 'Invalid limit value' }, { status: 400 });
    }

    const [countResult] = await pool.query<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total
        FROM everytime_articles articles
        JOIN everytime_article_labels labels ON articles.id = labels.article_id
        WHERE JSON_CONTAINS(labels.category_ids, ?)
      `,
      [JSON.stringify(categoryIds)]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `
        SELECT articles.*, labels.category_ids, labels.is_verified
        FROM everytime_articles articles
        JOIN everytime_article_labels labels ON articles.id = labels.article_id
        WHERE JSON_CONTAINS(labels.category_ids, ?)
        LIMIT ? OFFSET ?
      `,
      [JSON.stringify(categoryIds), limit, start]
    );

    return NextResponse.json({
      data: rows,
      pagination: {
        totalCount: countResult[0].total,
        start,
        limit,
      },
    });
  }
  catch (error) {
    console.error('Error while fetching articles by categories:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
