'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES } from '@/constants/categories';

interface ArticleStatistics {
  [key: number]: number;
}

export default function StatisticsPage() {
  const [articleStatistics, setArticleStatistics] = useState<ArticleStatistics | null>(null);

  useEffect(() => {
    const fetchArticleStatistics = async () => {
      try {
        const response = await fetch('/api/articles/statistics');
        const data = await response.json();
        setArticleStatistics(data);
      }
      catch (error) {
        console.error('Error fetching article statistics:', error);
      }
    };

    fetchArticleStatistics();
  }, []);

  if (!articleStatistics) {
    return <div>Loading...</div>;
  }

  const chartData = CATEGORIES.map((category) => ({
    name: category.name,
    value: articleStatistics[category.id] || 0,
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">게시글 통계</h1>
      <Card className="bg-white shadow rounded-lg p-6">
        <CardHeader>
          <CardTitle>카테고리별 레이블링된 게시글 수</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
