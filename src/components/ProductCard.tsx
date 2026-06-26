import { useState, useMemo } from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size?: string, variantId?: number) => void;
  isWishlisted?: boolean;
  onWishlist?: () => void;
  onQuickView?: () => void;
  getStock?: (productId: number, color: string, size?: string) => number;
  isInStock?: (productId: number, color?: string, size?: string) => boolean;
  showViewers?: boolean;
}

// Color mapping for visual display
const COLOR_MAP: Record<string, string> = {
  'Negro': '#1a1a1a',
  'Blanco': '#ffffff',
  'Beige': '#f5f5dc',
  'Marrón': '#8b4513',
  'Gris': '#808080',
  'Navy': '#1a3a5c',
  'Rosa': '#ffc0cb',
  'Verde': '#228b22',
  'Rojo': '#dc143c',
  'Dorado': '#ffd700',
  'Plata': '#c0c0c0',
  'Azul': '#4169e1',
  'Morado': '#800080',
  'Naranja': '#ff8c00',
  'Amarillo': '#ffd700',
  'Estampado': '#e8d4c4',
  // Beauty shades
  'Nude': '#e3b5a4',
  'Coral': '#ff7f50',
  'Burdeos': '#722f37',
  'Claro': '#fde8d8',
  'Medio': '#d4a574',
  'Oscuro': '#8b5a3c',
  'Porcelana': '#f0e6dc',
  'Arena': '#d4b896',
  'Canela': '#d2691e',
  'Bronce': '#cd7f32',
};

export default function ProductCard({
  product,
  onAddToCart,
  isWishlisted = false,
  onWishlist,
  onQuickView,
  getStock,
  isInStock,
  showViewers = false,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Simulated viewers count (random but consistent per product)
  const viewersCount = useMemo(() => {
    if (!showViewers) return 0;
    return Math.floor(Math.random() * 15) + 3;
  }, [product.id, showViewers]);

  // Extract unique colors and sizes from variants
  const variants = product.product_variants || [];

  // Get unique colors from variants (only with stock > 0)
  const availableColors = useMemo(() => {
    const colors = variants
      .filter((v) => v.color && v.active !== false && v.stock > 0)
      .map((v) => v.color as string);
    return [...new Set(colors)];
  }, [variants]);

  // Get unique sizes from variants
  const availableSizes = useMemo(() => {
    const sizes = variants
      .filter((v) => v.size && v.active !== false && v.stock > 0)
      .map((v) => v.size as string);
    return [...new Set(sizes)];
  }, [variants]);

  // Fallback to product.colors and product.sizes if no variants
  const displayColors = availableColors.length > 0 ? availableColors : (product.colors || []);
  const displaySizes = availableSizes.length > 0 ? availableSizes : (product.sizes || []);

  const [selectedColor, setSelectedColor] = useState(displayColors[0] || '');
  const [selectedSize, setSelectedSize] = useState(displaySizes[0] || '');

  // Find the matching variant for selected color/size
  const selectedVariant = useMemo(() => {
    return variants.find((v) => {
      const colorMatch = v.color === selectedColor;
      const sizeMatch = displaySizes.length > 0 ? v.size === selectedSize : true;
      return colorMatch && sizeMatch && v.active !== false;
    });
  }, [variants, selectedColor, selectedSize, displaySizes]);

  // Check stock based on variant
  const stock = selectedVariant?.stock ?? product.stock ?? 0;

  // Check if the entire product is out of stock
  const isProductOutOfStock = useMemo(() => {
    if (variants.length > 0) {
      return variants.every((v) => !v.active || v.stock <= 0);
    }
    return (product.stock ?? 0) <= 0;
  }, [variants, product.stock]);

  const isOutOfStock = stock <= 0 || isProductOutOfStock;
  const isLowStock = stock > 0 && stock <= 5;

  // Check if a specific color has any stock
  const colorHasStock = (color: string): boolean => {
    return variants.some((v) => v.color === color && v.active !== false && v.stock > 0);
  };

  // Check if a specific size has any stock
  const sizeHasStock = (size: string): boolean => {
    return variants.some((v) => v.size === size && v.active !== false && v.stock > 0);
  };

  // Get available sizes for selected color
  const sizesForColor = useMemo(() => {
    if (!selectedColor) return displaySizes;
    const sizes = variants
      .filter((v) => v.color === selectedColor && v.active !== false)
      .map((v) => v.size as string)
      .filter(Boolean);
    return [...new Set(sizes)];
  }, [variants, selectedColor]);

  // Get available colors for selected size
  const colorsForSize = useMemo(() => {
    if (displaySizes.length === 0) return displayColors;
    const colors = variants
      .filter((v) => v.size === selectedSize && v.active !== false)
      .map((v) => v.color as string)
      .filter(Boolean);
    return [...new Set(colors)];
  }, [variants, selectedSize, displaySizes]);

  // Check if a specific color-size combo is out of stock
  const isVariantOutOfStock = (color: string, size?: string) => {
    const variant = variants.find((v) => {
      const colorMatch = v.color === color;
      const sizeMatch = size ? v.size === size : true;
      return colorMatch && sizeMatch;
    });
    return (variant?.stock ?? 0) <= 0;
  };

  const discount = product.original_price || product.originalPrice
    ? Math.round((((product.original_price || product.originalPrice || 0) - product.price) / (product.original_price || product.originalPrice || product.price)) * 100)
    : null;

  function handleAdd() {
    if (isOutOfStock) return;

    onAddToCart(product, selectedColor, displaySizes.length > 0 ? selectedSize : undefined, selectedVariant?.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleColorChange(color: string) {
    setSelectedColor(color);
    // Auto-select size if only one size available for this color
    const sizes = variants
      .filter((v) => v.color === color && v.active !== false)
      .map((v) => v.size)
      .filter(Boolean);
    if (sizes.length === 1 && sizes[0]) {
      setSelectedSize(sizes[0] as string);
    }
  }

  function handleSizeChange(size: string) {
    setSelectedSize(size);
    // Check if current color is available for this size
    const colors = variants
      .filter((v) => v.size === size && v.active !== false)
      .map((v) => v.color)
      .filter(Boolean);
    if (colors.length === 1 && colors[0]) {
      setSelectedColor(colors[0] as string);
    } else if (!colors.includes(selectedColor) && colors.length > 0) {
      setSelectedColor(colors[0] as string);
    }
  }

  return (
    <div
      className="group relative bg-white rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#F5EDE5]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#FDF8F4] aspect-[3/4]">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            hovered ? 'scale-110' : 'scale-100'
          }`}
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-500 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Badges */}
        {(product.badge || product.is_new || product.is_sale || isLowStock) && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <span
                className={`text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
                  product.is_sale
                    ? 'bg-[#D4A59A] text-white'
                    : product.is_new
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-white/90 text-[#6B4423]'
                }`}
              >
                {product.badge}
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full bg-orange-100 text-orange-700">
                ¡Últimas {stock}!
              </span>
            )}
            {isOutOfStock && (
              <span className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                Agotado
              </span>
            )}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist?.();
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
            isWishlisted
              ? 'bg-[#D4A59A] text-white scale-110'
              : 'bg-white/80 text-[#B89B8A] hover:bg-white hover:text-[#D4A59A] hover:scale-110'
          }`}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick view */}
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 transition-all duration-500 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.();
            }}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#6B4423] text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
          >
            <Eye size={12} />
            Vista rápida
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-[10px] text-[#D4A59A] font-semibold uppercase tracking-widest mb-1">
          {product.category}
        </p>

        <h3 className="text-sm font-semibold text-[#6B4423] leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className={
                  i < Math.floor(product.rating)
                    ? 'text-[#D4A59A] fill-[#D4A59A]'
                    : 'text-[#E8D4C4]'
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-[#B89B8A]">
            ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-[#6B4423]">
            ${product.price} MXN
          </span>
          {(product.original_price || product.originalPrice) && (
            <>
              <span className="text-xs text-[#B89B8A] line-through">
                ${product.original_price || product.originalPrice}
              </span>
              {discount && (
                <span className="text-[10px] font-bold text-[#D4A59A] bg-[#FDF0ED] px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Color swatches */}
        {displayColors.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {displayColors.map((color) => {
              const bg = COLOR_MAP[color] || color.toLowerCase();
              const isAvailable = displaySizes.length > 0
                ? sizesForColor.some((s) => !isVariantOutOfStock(color, s))
                : !isVariantOutOfStock(color);
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  disabled={!isAvailable}
                  style={{ backgroundColor: bg }}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 relative ${
                    isSelected
                      ? 'border-[#D4A59A] scale-110 shadow-md'
                      : 'border-transparent hover:scale-110'
                  } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={`${color}${!isAvailable ? ' (Agotado)' : ''}`}
                >
                  {!isAvailable && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-0.5 bg-red-400 rotate-45 absolute" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Size buttons */}
        {displaySizes.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {displaySizes.map((size) => {
              const isAvailable = selectedColor
                ? !isVariantOutOfStock(selectedColor, size)
                : variants.some((v) => v.size === size && v.stock > 0);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  disabled={!isAvailable}
                  className={`text-[10px] px-3 py-1 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? 'border-[#D4A59A] bg-[#FDF0ED] text-[#8B7355]'
                      : !isAvailable
                      ? 'border-[#E8D4C4] text-[#E8D4C4] cursor-not-allowed line-through bg-gray-50'
                      : 'border-[#E8D4C4] text-[#B89B8A] hover:border-[#D4A59A]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={added || isOutOfStock}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-500 ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : added
              ? 'bg-[#8B7355] text-white scale-[0.98]'
              : 'bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] hover:from-[#8B7355] hover:to-[#A08278] text-white hover:shadow-lg hover:shadow-[#D4A59A]/30 active:scale-[0.98]'
          }`}
        >
          <ShoppingBag size={14} className={added ? 'animate-bounce' : ''} />
          {isOutOfStock ? 'Agotado' : added ? '¡Agregado!' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
