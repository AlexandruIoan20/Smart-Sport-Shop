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

export interface RecommendedSport {
  sportId: string;
  sportName: string;
  description: string;
  compatibilityScore: number;
  rank: number;
  isTeamSport: boolean;
  isOutdoor: boolean;
  effortLevel: number;
  imageUrl: string | null;
}

export interface RecommendedProduct {
  productId: string;
  productName: string;
  categoryName: string;
  sportName: string | null;
  price: number;
  brand: string | null;
  imageUrl: string | null;
  targetLevel: string;
  reason: string | null;
  stockQuantity: number;
}

export interface FullRecommendation {
  sessionId: string;
  userLevel: string;
  createdAt: string;
  sports: RecommendedSport[];
  products: RecommendedProduct[];
}

export interface CartItem {
  productId: string;
  productName: string;
  brand: string;
  imageUrl: string | null;
  quantityInCart: number;
  unitPrice: number;
  stockAvailable: number;
}

export interface OrderCart {
  orderId: string;
  orderStatus: string;
  totalAmount: number;
  shippingAddress: string;
  items: CartItem[];
}