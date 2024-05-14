'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CATEGORIES, type Category } from '@/constants/categories';

function labelToCategory(label: string) {
  const categoryId = parseInt(label.split('_')[1] || '0', 10);
  const category = CATEGORIES.find((category) => category.id === categoryId);
  return category;
}

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isError, setIsError] = useState(false);
  const [predictedCategory, setPredictedCategory] = useState<Category>();
  const [predictedScore, setPredictedScore] = useState<number>();

  const handleSubmit = async () => {
    const combinedContent = `${title} ${content}`;
    try {
      const response = await fetch(`/api/predict?query=${encodeURIComponent(combinedContent)}`);
      const { message } = await response.json();
      if (message && message.length > 0) {
        setPredictedCategory(labelToCategory(message[0].label));
        setPredictedScore(message[0].score);
      }
    }
    catch (error) {
      console.error('Error fetching category:', error);
      setIsError(true);
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col gap-2">
      <div className="border border-input flex flex-col">
        <input
          className="p-4 border-b border-input text-xl placeholder:font-semibold font-semibold outline-none w-full"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="resize-none h-[400px] outline-none w-full p-4 border-b border-input"
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center pl-4">
          <div className="flex">
            <Button size="icon" variant="ghost">
              <img className="w-6" src="/icon-tag.svg" />
            </Button>
            <Button size="icon" variant="ghost">
              <img className="w-6" src="/icon-file.svg" />
            </Button>
          </div>
          <div className="flex gap-8">
            <Button className="w-12 p-0 h-12" onClick={handleSubmit}>
              <img className="w-8 h-8" src="/icon-write.svg" />
            </Button>
          </div>
        </div>
      </div>
      {predictedCategory && (
        <div className="p-4 border border-input mt-4 rounded-md bg-green-100 text-lg">
          {`카테고리: ${predictedCategory.name} (확률: ${(predictedScore! * 100).toFixed(2)}%)`}
        </div>
      )}
      {isError && (
        <div className="p-4 border border-input mt-4 rounded-md bg-red-100">
          <p className="text-sm text-red-700">카테고리 예측 실패</p>
        </div>
      )}
    </div>
  );
}
