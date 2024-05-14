export interface Article {
  id: string;
  title: string;
  text: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  category_id: number;
  is_verified: boolean;
}
