import { type RowDataPacket } from 'mysql2';
import { type NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryIds = JSON.parse(searchParams.get('categoryIds') || '[]');
    const categoryId = categoryIds[0];
    const start = parseInt(searchParams.get('start') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (isNaN(start) || start < 0) {
      return NextResponse.json({ message: 'Invalid start value' }, { status: 400 });
    }

    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json({ message: 'Invalid limit value' }, { status: 400 });
    }

    const [countResult] = typeof categoryId === 'number'
      ? await pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM everytime_original_articles articles
        JOIN everytime_article_predictions predictions ON articles.id = predictions.id
        WHERE predictions.category_id = ?
      `,
        [categoryId]
      ) : await pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM everytime_original_articles articles
        JOIN everytime_article_predictions predictions ON articles.id = predictions.id
      `
      );

    const [rows] = typeof categoryId === 'number'
      ? await pool.query<RowDataPacket[]>(
        `
        SELECT articles.*, predictions.category_id
        FROM everytime_original_articles articles
        JOIN everytime_article_predictions predictions ON articles.id = predictions.id
        WHERE predictions.category_id = ?
        LIMIT ? OFFSET ?
      `,
        [categoryId, limit, start]
      ) : await pool.query<RowDataPacket[]>(
        `
        SELECT articles.*, predictions.category_id
        FROM everytime_original_articles articles
        JOIN everytime_article_predictions predictions ON articles.id = predictions.id
        LIMIT ? OFFSET ?
      `,
        [limit, start]
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
