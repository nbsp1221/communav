import { type RowDataPacket } from 'mysql2';
import { type NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const API_URL = 'http://localhost:11050';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface SearchResult {
  id: number;
  title: string;
  text: string;
  similarity: number;
}

interface SearchResponse {
  data: SearchResult[];
  pagination: {
    totalCount: number;
    start: number;
    limit: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const start = searchParams.get('start') || '0';
    const limit = searchParams.get('limit') || '20';

    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 검색 API 호출 (페이지네이션 포함)
    const searchUrl = `${API_URL}/search?query=${query}&start=${start}&limit=${limit}`;
    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}`);
    }

    const searchResponse: SearchResponse = await response.json();

    if (searchResponse.data.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: searchResponse.pagination,
      }, { headers: corsHeaders });
    }

    // 검색된 article_id들로 MySQL에서 전체 정보 조회
    const articleIds = searchResponse.data.map((result) => result.id);

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT articles.*, predictions.category_id
      FROM articles
      JOIN article_predictions predictions ON articles.id = predictions.id
      WHERE articles.id IN (?)
      ORDER BY FIELD(articles.id, ?)
      `,
      [articleIds, articleIds]
    );

    // 검색 결과의 순서와 유사도 점수를 유지하면서 MySQL 데이터와 병합
    const mergedResults = rows.map((row) => {
      const searchResult = searchResponse.data.find((result) => result.id === row.id);
      return {
        ...row,
        similarity: searchResult?.similarity || 0,
      };
    });

    // 검색 결과 반환 (페이지네이션 정보 포함)
    return NextResponse.json(
      {
        data: mergedResults,
        pagination: searchResponse.pagination,
      },
      { headers: corsHeaders }
    );
  }
  catch (error) {
    console.error('Error while searching articles:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export const dynamic = 'force-dynamic';
