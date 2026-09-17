export interface Game {
  name?: string;
  genre?: string;
  platform?: string;
  coverImage?: string;
  version?: string;
  digitalStore?: string;
  description?: string;
  status?: string;
  completionDate?: string;
  playtime?: number;
  comment?: string;
  tags?: string[];
  rating?: number;
  isBorrowed?: boolean; // Lent to someone
  borrowedTo?: string;
  borrowDate?: string;
  isBorrowedFrom?: boolean; // Borrowed from someone
  borrowedFrom?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  id: string;
  [key: string]: unknown;
}
