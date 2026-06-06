export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'Ropa' | 'Belleza';
  colors: string[];
  sizes?: string[];
  badge?: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize?: string;
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;