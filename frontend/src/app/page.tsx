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

  const totalPages = Math.ceil(pagination.totalCount / pagination.limit);
  const currentPage = pagination.start / pagination.limit + 1;
  const pageRange = 5;
  const startPage = Math.max(1, currentPage - Math.floor(pageRange / 2));
  const endPage = Math.min(totalPages, startPage + pageRange - 1);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  const handlePageChange = (page: number) => {
    const minPage = 1;
    const newPage = Math.max(minPage, Math.min(page, totalPages));

    setPagination((prevPagination) => ({
      ...prevPagination,
      start: (newPage - 1) * prevPagination.limit,
    }));
  };

  return (
    <div>
      <nav className="bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-white text-2xl font-bold">커뮤니티</a>
            </div>
            <div className="flex space-x-4">
              <a href="/labeling" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">라벨링</a>
              <a href="/statistics" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">통계</a>
            </div>
          </div>
        </div>
      </nav>
      <div className="container mx-auto py-8">
        <div className="mb-4 flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
              onClick={() => toggleCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {articles.map((article) => (
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
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">{article.created_at}</span>
                </div>
              </Card>
            </a>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
              {startPage > 1 && (
                <PaginationItem>
                  <PaginationLink href="#" onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
              )}
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {visiblePages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {endPage < totalPages && (
                <PaginationItem>
                  <PaginationLink href="#" onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext href="#" onClick={() => handlePageChange(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
