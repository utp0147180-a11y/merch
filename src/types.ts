// Product Types
export type CategoryType = 'clothing' | 'beauty' | 'accessories' | 'footwear';
export type ProductCategory = 'Ropa' | 'Belleza' | 'Accesorios' | 'Calzado';

// Product Variant - single source of truth for colors, sizes, stock, SKU
export interface ProductVariant {
  id: number;
  product_id: number;
  color: string | null;
  size: string | null;
  sku: string | null;
  price: number | null;  // Uses product.price if null
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Product Image - multiple images per product
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

// Main Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  originalPrice?: number;  // Backward compatibility
  image: string;
  category: ProductCategory | string;
  category_type?: CategoryType;
  colors?: string[];  // Kept for backward compatibility
  sizes?: string[];   // Kept for backward compatibility
  badge?: string;
  rating: number;
  reviews: number;
  is_new?: boolean;
  isNew?: boolean;
  is_sale?: boolean;
  isSale?: boolean;
  active?: boolean;
  featured?: boolean;
  sku?: string;
  slug?: string;
  stock?: number;
  brand?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;

  // Relations - populated from joins
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
}

// Cart Item - stores variant selection
export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize?: string;
  selectedVariantId?: number;  // Reference to the selected variant
  key?: string;  // Unique key for cart item identification
}

// User
export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

// Order
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

// Order Item - includes variant reference for stock deduction
export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size?: string;
  variantId?: number;  // Reference to the variant for stock deduction
}

// Category Type Configuration
export interface CategoryTypeConfig {
  type: CategoryType;
  label: string;
  hasColors: boolean;
  hasSizes: boolean;
  sizes: string[];
  colors: string[];
}

// Available options for product variants
export const VARIANT_OPTIONS = {
  colors: [
    'Negro',
    'Blanco',
    'Beige',
    'Marrón',
    'Gris',
    'Navy',
    'Rosa',
    'Verde',
    'Rojo',
    'Dorado',
    'Plata',
    'Azul',
    'Morado',
    'Naranja',
    'Amarillo',
    'Estampado',
  ],
  clothingSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'],
  footwearSizes: ['22', '23', '24', '25', '26', '27', '28', '29', '30'],
  beautyShades: [
    'Rojo',
    'Nude',
    'Rosa',
    'Coral',
    'Burdeos',
    'Claro',
    'Medio',
    'Oscuro',
    'Porcelana',
    'Arena',
    'Canela',
    'Bronce',
  ],
} as const;

// Category type configurations
export const CATEGORY_TYPE_CONFIGS: CategoryTypeConfig[] = [
  {
    type: 'clothing',
    label: 'Ropa',
    hasColors: true,
    hasSizes: true,
    sizes: [...VARIANT_OPTIONS.clothingSizes],
    colors: [...VARIANT_OPTIONS.colors],
  },
  {
    type: 'beauty',
    label: 'Belleza',
    hasColors: true,
    hasSizes: false,
    sizes: [],
    colors: [...VARIANT_OPTIONS.beautyShades],
  },
  {
    type: 'accessories',
    label: 'Accesorios',
    hasColors: true,
    hasSizes: true,
    sizes: ['Única'],
    colors: [...VARIANT_OPTIONS.colors],
  },
  {
    type: 'footwear',
    label: 'Calzado',
    hasColors: true,
    hasSizes: true,
    sizes: [...VARIANT_OPTIONS.footwearSizes],
    colors: [...VARIANT_OPTIONS.colors],
  },
];
