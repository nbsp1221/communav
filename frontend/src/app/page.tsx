'use client';

import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { categories } from '@/constants/categories';
import { type Article } from '@/types';

interface FetchArticlesRequest {
  categoryIds: number[];
  start: number;
  limit: number;
}

interface FetchArticlesResponse {
  data: Article[];
  pagination: {
    totalCount: number;
    start: number;
    limit: number;
  };
}

async function fetchArticles(request: FetchArticlesRequest): Promise<FetchArticlesResponse> {
  const response = await fetch(`/api/articles?${queryString.stringify({
    categoryIds: JSON.stringify(request.categoryIds),
    start: request.start,
    limit: request.limit,
  })}`);

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

export default function CommunityPage() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({ totalCount: 0, start: 0, limit: 20 });

  useEffect(() => {
    fetchArticles({
      categoryIds: selectedCategories,
      start: pagination.start,
      limit: pagination.limit,
    })
      .then((response) => {
        setArticles(response.data);
        setPagination(response.pagination);
      })
      .catch((error) => {
        console.error('Error while fetching articles:', error);
      });
  }, [selectedCategories, pagination.start, pagination.limit]);

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((value) => value !== categoryId));
    }
    else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prevPagination) => ({
      ...prevPagination,
      start: (page - 1) * prevPagination.limit,
    }));
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.limit);
  const currentPage = pagination.start / pagination.limit + 1;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">커뮤니티</h1>
      <div className="mb-4 flex space-x-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategories.includes(category.id) ? 'secondary' : 'outline'}
            onClick={() => toggleCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <Card key={article.id} className="p-4">
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
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">{article.created_at}</span>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={() => handlePageChange(currentPage - 1)} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  isActive={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext href="#" onClick={() => handlePageChange(currentPage + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
