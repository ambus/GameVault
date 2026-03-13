export interface WishlistItem {
  id: string;
  name: string;
  platform: string;
  distributionForm?: string;
  coverImage?: string; // Base64 string preferred
  link: string;
  releaseDate?: string;
  comment?: string;
}
