export interface Article {
  id: string;
  title: string;
  text: string;
  created_at: string;
  category_ids: number[];
  is_verified: boolean;
}
