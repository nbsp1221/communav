import dayjs from 'dayjs';
import { FaRegCommentDots, FaRegThumbsUp } from 'react-icons/fa';
import { CATEGORIES } from '@/constants/categories';
import { type Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard(props: ArticleCardProps) {
  const { article } = props;

  const categoryName = CATEGORIES.find((category) => category.id === article.category_id)?.name;

  return (
    <div className="py-4 bg-white">
      <a href={`https://everytime.kr/370443/v/${article.id}`} target="_blank">
        <div>
          <div className="text-sm text-gray-500">{categoryName}</div>
          <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
          <p className="text-gray-800 h-12 mb-2 line-clamp-2">{article.text}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex gap-3">
              {article.like_count > 0 && (
                <div className="flex items-center">
                  <FaRegThumbsUp className="text-red-500 mr-1" />
                  <span className="text-red-500">{article.like_count}</span>
                </div>
              )}
              {article.comment_count > 0 && (
                <div className="flex items-center">
                  <FaRegCommentDots className="text-cyan-500 mr-1" />
                  <span className="text-cyan-500">{article.comment_count}</span>
                </div>
              )}
            </div>
            <div>
              {dayjs(article.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
