'use client';

import queryString from 'query-string';
import { useEffect, useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type Article } from '@/types';
import { ArticleCard } from './ArticleCard';
import { CategoryFilter } from './CategoryFilter';

interface FetchArticlesRequest {
  categoryId: number | null;
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
    categoryId: request.categoryId,
    start: request.start,
    limit: request.limit,
  })}`);

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({ totalCount: 0, start: 0, limit: 20 });

  useEffect(() => {
    fetchArticles({
      categoryId: selectedCategory,
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
  }, [selectedCategory, pagination.start, pagination.limit]);

  const selectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setPagination((prevPagination) => ({
      ...prevPagination,
      start: 0,
    }));
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
      <div className="container mx-auto py-8">
        <div className="mb-4">
          <CategoryFilter selectedCategory={selectedCategory} onClick={selectCategory} />
        </div>
        <Separator />
        <div className="grid grid-cols-2">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className={cn('border-b border-border', index % 2 ? 'pl-4' : 'pr-4 border-r')}
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
              {startPage > 1 && (
                <>
                  <PaginationItem>
                    <PaginationLink href="#" onClick={() => handlePageChange(1)}>1</PaginationLink>
                  </PaginationItem>
                  {startPage > 2 && <PaginationEllipsis />}
                </>
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
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <PaginationEllipsis />}
                  <PaginationItem>
                    <PaginationLink href="#" onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                  </PaginationItem>
                </>
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
