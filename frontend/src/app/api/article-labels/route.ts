import { type NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, categoryIds } = body;

    if (!articleId || !categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    await pool.query(
      `
        INSERT INTO everytime_article_labels (
          article_id,
          category_ids,
          is_ambiguous,
          is_verified
        )
        VALUES (?, ?, 0, 0)
        ON DUPLICATE KEY UPDATE
          category_ids = VALUES(category_ids),
          is_ambiguous = 0,
          is_verified = 0
      `,
      [articleId, JSON.stringify(categoryIds)]
    );

    return NextResponse.json({ message: 'Labels saved successfully' });
  }
  catch (error) {
    console.error('Error while saving labels:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
