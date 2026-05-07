export interface Game {
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
