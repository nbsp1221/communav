'use client';

import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { categories } from '@/constants/categories';
import { cn } from '@/lib/utils';
import { type Article } from '@/types';

interface FormData {
  checkedCategories: Record<string, boolean>;
}

interface LabelerProps {
  article: Article;
  saved: boolean;
  onSubmit: (articleId: string, categoryIds: number[]) => void;
}

export function Labeler(props: LabelerProps) {
  const { article, saved, onSubmit } = props;
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmitHandler: SubmitHandler<FormData> = (data) => {
    const categoryIds = Object.entries(data.checkedCategories)
      .filter(([, checked]) => checked)
      .map(([id]) => Number(id));

    onSubmit(article.id, categoryIds);
  };

  return (
    <div key={article.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
      <p className="text-gray-600 mb-4">{article.text}</p>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <h3 className="text-lg font-semibold mb-2">Select Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <Controller
                control={control}
                name={`checkedCategories.${category.id}`}
                render={({ field }) => (
                  <Checkbox
                    id={`category-${category.id}-${article.id}`}
                    className="mr-2"
                    value={category.id}
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                )}
              />
              <Label htmlFor={`category-${category.id}-${article.id}`}>
                {category.name}
              </Label>
            </div>
          ))}
        </div>
        <Button
          type="submit"
          className={cn(
            'mt-4',
            saved ? 'bg-green-500 hover:bg-green-600' : ''
          )}
        >
          저장
        </Button>
      </form>
    </div>
  );
}
