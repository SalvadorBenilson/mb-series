export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverUrl: string;
  content: string[]; // Array of page content (strings)
  isFeatured?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: 'KWIK' | 'IBAN' | 'Reference' | 'Express';
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  lastPageIndex: number;
  updatedAt: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  source: string;
  type: 'music' | 'movie' | 'author';
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
