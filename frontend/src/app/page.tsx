'use client';

import { Search } from 'lucide-react';
import queryString from 'query-string';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

interface FetchSearchResponse {
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

async function searchArticles(query: string, start: number, limit: number): Promise<FetchSearchResponse> {
  const response = await fetch(`/api/search?${queryString.stringify({
    query: encodeURIComponent(query),
    start,
    limit,
  })}`);

  if (!response.ok) {
    throw new Error('Failed to search articles');
  }

  return response.json();
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [pagination, setPagination] = useState({ totalCount: 0, start: 0, limit: 20 });
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    if (!isSearchMode) {
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
    }
    else if (currentSearch) {
      // 검색 모드이고 현재 검색어가 있는 경우, 페이지 변경 시 재검색
      searchArticles(currentSearch, pagination.start, pagination.limit)
        .then((response) => {
          setArticles(response.data);
          setPagination(response.pagination);
        })
        .catch((error) => {
          console.error('Error while searching articles:', error);
        });
    }
  }, [selectedCategory, pagination.start, pagination.limit, isSearchMode, currentSearch]);

  const handleSearch = async () => {
    try {
      const response = await searchArticles(searchQuery, 0, pagination.limit);
      setArticles(response.data);
      setPagination(response.pagination);
      setCurrentSearch(searchQuery);
      setIsSearchMode(true);
      setIsSearchOpen(false);
    }
    catch (error) {
      console.error('Error while searching articles:', error);
    }
  };

  const exitSearch = () => {
    setIsSearchMode(false);
    setCurrentSearch('');
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, start: 0 }));
  };

  const selectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setPagination((prevPagination) => ({
      ...prevPagination,
      start: 0,
    }));
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.limit);
  const currentPage = Math.floor(pagination.start / pagination.limit) + 1;
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
        <div className="mb-4 flex justify-between items-center">
          {isSearchMode ? (
            <>
              <h1 className="text-2xl font-bold">
                Search results for &quot;{currentSearch}&quot;
              </h1>
              <div className="flex gap-2">
                <Button onClick={exitSearch} variant="outline">
                  Back to Categories
                </Button>
                <Button onClick={() => setIsSearchOpen(true)} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  New Search
                </Button>
              </div>
            </>
          ) : (
            <>
              <CategoryFilter selectedCategory={selectedCategory} onClick={selectCategory} />
              <Button onClick={() => setIsSearchOpen(true)} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </>
          )}
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

        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search Articles</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </DialogContent>
        </Dialog>

        {articles.length > 0 && pagination.totalCount > pagination.limit && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
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
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
