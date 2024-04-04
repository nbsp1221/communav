'use client';

import { useEffect, useState } from 'react';
import { categories } from '@/constants/categories';
import { Labeler } from './Labeler';
import { type Article } from './types';

export default function LabelingPage() {
  const [unlabeledArticles, setUnlabeledArticles] = useState<Article[]>([]);
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});

  const fetchUnlabeledArticles = async () => {
    try {
      const response = await fetch('/api/unlabeled-articles?limit=10');

      if (!response.ok) {
        console.error('Failed to fetch unlabeled article');
        return;
      }

      const data = await response.json();
      setUnlabeledArticles(data);
    }
    catch (error) {
      console.error('Error while fetching unlabeled article:', error);
    }
  };

  useEffect(() => {
    fetchUnlabeledArticles();
  }, []);

  const handleLabelSubmit = async (articleId: string, categoryIds: number[]) => {
    try {
      const response = await fetch('/api/article-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          categoryIds,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save labels');
        return;
      }

      setSavingState((prevSavingState) => ({
        ...prevSavingState,
        [articleId]: true,
      }));
    }
    catch (error) {
      console.error('Error while saving labels:', error);
    }
  };

  if (unlabeledArticles.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Article Labeling</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <p className="text-gray-600 mb-4">
          카테고리를 선택 후 저장 버튼을 눌러주세요. 카테고리는 중복 선택이 가능하며, 아무것도 선택하지 않고 저장할 경우 어떠한 카테고리에도 속할 수 없다는 정보로 저장됩니다.
        </p>
        <ul className="list-disc list-inside space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <span className="font-semibold">{category.name}</span>
              <span>: {category.description}</span>
            </li>
          ))}
        </ul>
      </div>
      {unlabeledArticles.map((article) => (
        <Labeler
          key={article.id}
          article={article}
          saved={savingState[article.id] || false}
          onSubmit={handleLabelSubmit}
        />
      ))}
      <pre className="bg-gray-100 p-4 rounded mb-8">
        {JSON.stringify(unlabeledArticles.map(({ id, text, title }) => ({ id, text, title })), null, 2)}
      </pre>
    </div>
  );
}
