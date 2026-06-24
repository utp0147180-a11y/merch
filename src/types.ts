export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  image: string;
  category: 'Ropa' | 'Belleza';
  colors: string[];
  sizes?: string[];
  badge?: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
  is_new?: boolean;
  is_sale?: boolean;
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
  items: OrderItem[];
  total: number;
  shipping: number;
  status: 'pendiente' | 'pagado' | 'entregado';
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size?: string;
}