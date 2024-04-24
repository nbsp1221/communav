'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { categories } from '@/constants/categories';
import { type Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard(props: ArticleCardProps) {
  const { article } = props;

  const searchParams = useSearchParams();
  const isVerifyMode = searchParams.get('verify') === 'true';

  const [isVerified, setIsVerified] = useState<boolean>(article.is_verified);

  const handleVerify = async () => {
    try {
      const response = await fetch('/api/article-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article.id,
          categoryIds: article.category_ids,
          isVerified: !isVerified,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save labels');
        return;
      }

      setIsVerified(!isVerified);
    }
    catch (error) {
      console.error('Error while saving labels:', error);
    }
  };

  return (
    <a key={article.id} href={`https://everytime.kr/370443/v/${article.id}`} target="_blank">
      <Card className="p-4 h-full">
        <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
        <p className="text-gray-600 mb-4">{article.text}</p>
        <div className="flex items-center space-x-2 mb-4">
          {article.category_ids.map((categoryId) => {
            const category = categories.find((category) => category.id === categoryId);

            if (category) {
              return (
                <Badge key={categoryId} variant="outline">
                  {category.name}
                </Badge>
              );
            }

            return null;
          })}
        </div>
        <div className="flex items-center space-x-4 justify-between">
          <span className="text-gray-500">{article.created_at}</span>
          {isVerifyMode && (
            <div className="mt-4">
              <Button
                className={isVerified ? 'bg-green-500 hover:bg-green-600' : ''}
                variant="default"
                onClick={(event) => {
                  event.preventDefault();
                  handleVerify();
                }}
              >
                검증
              </Button>
            </div>
          )}
        </div>
      </Card>
    </a>
  );
}
