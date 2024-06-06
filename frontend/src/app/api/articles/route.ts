import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import { type NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!, 10) : null;
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
        FROM articles
        JOIN article_predictions predictions ON articles.id = predictions.id
        WHERE predictions.category_id = ?
        ORDER BY articles.created_at DESC
      `,
        [categoryId]
      ) : await pool.query<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM articles
        JOIN article_predictions predictions ON articles.id = predictions.id
        ORDER BY articles.created_at DESC
      `
      );

    const [rows] = typeof categoryId === 'number'
      ? await pool.query<RowDataPacket[]>(
        `
        SELECT articles.*, predictions.category_id
        FROM articles
        JOIN article_predictions predictions ON articles.id = predictions.id
        WHERE predictions.category_id = ?
        ORDER BY articles.created_at DESC
        LIMIT ? OFFSET ?
      `,
        [categoryId, limit, start]
      ) : await pool.query<RowDataPacket[]>(
        `
        SELECT articles.*, predictions.category_id
        FROM articles
        JOIN article_predictions predictions ON articles.id = predictions.id
        ORDER BY articles.created_at DESC
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

export async function POST(request: NextRequest) {
  try {
    const { title, text, categoryId } = await request.json();

    if (!title || !text) {
      return NextResponse.json({ message: 'Title and text are required' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO articles (title, text, created_at)
      VALUES (?, ?, ?)
    `,
      [title, text, createdAt]
    );

    await pool.query<ResultSetHeader>(
      `
      INSERT INTO article_predictions (id, category_id)
      VALUES (?, ?)
    `,
      [result.insertId, categoryId]
    );

    return NextResponse.json({ message: 'Article created successfully', id: result.insertId }, {
      headers: corsHeaders,
    });
  }
  catch (error) {
    console.error('Error while creating new article:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

export const dynamic = 'force-dynamic';
