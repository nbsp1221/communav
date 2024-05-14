'use client';

import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/constants/categories';

interface CategoryFilterProps {
  selectedCategory: number | null;
  onClick: (category: number) => void;
}

export function CategoryFilter(props: CategoryFilterProps) {
  const { selectedCategory, onClick } = props;

  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category.id}
            className="rounded-full"
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => onClick(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
