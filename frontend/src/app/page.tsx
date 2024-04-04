'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const categories = ['일반', '질문', '정보', '유머', '뉴스'];

const dummyPosts = [
  {
    id: 1,
    title: '커뮤니티 첫 글입니다.',
    summary: '안녕하세요. 커뮤니티에 처음 글을 작성합니다. 앞으로 잘 부탁드립니다!',
    comments: 5,
    likes: 10,
    createdAt: '2023-04-01',
    categories: ['일반'],
  },
  {
    id: 2,
    title: 'TypeScript 질문드립니다.',
    summary: 'TypeScript에서 인터페이스와 타입 별칭의 차이점이 궁금합니다. 설명 부탁드립니다.',
    comments: 3,
    likes: 8,
    createdAt: '2023-04-02',
    categories: ['질문'],
  },
  // ... 추가 더미 데이터
];

const CommunityPage = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
    else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const filteredPosts = dummyPosts.filter((post) => selectedCategories.every((category) => post.categories.includes(category)));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">커뮤니티 게시글</h1>
      <div className="mb-4 flex space-x-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategories.includes(category) ? 'secondary' : 'outline'}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="p-4">
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.summary}</p>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{post.comments} 댓글</Badge>
              <Badge variant="outline">{post.likes} 좋아요</Badge>
              <span className="text-gray-500">{post.createdAt}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage;
