export interface Category {
  categoryId: string;
  name: string;
  parentId: string | null;
  description: string | null;
}

export interface Product {
  productId: string;
  name: string;
  description: string | null;
  price: number;
  categoryName: string;
  sportName: string | null;
  targetLevel: string;
  brand: string | null;
  imageUrl: string | null;
  stockQuantity: number;
  createdAt: string;
}

export interface Sport {
  sportId: string;
  name: string;
  description: string;
  teamSport: boolean;
  outdoor: boolean;
  effortLevel: number;
  minBudget: number;
  imageUrl: string | null;
  active: boolean;
}