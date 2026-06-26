import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useWishlist } from '../contexts/WishlistContext';

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, color: string, size?: string, variantId?: number) => void;
}

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
};

export default function QuickViewModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: QuickViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [added, setAdded] = useState(false);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const variants = product?.product_variants || [];

  // Get unique colors and sizes from variants
  const availableColors = useMemo(() => {
    const colors = variants
      .filter((v) => v.color && v.active !== false)
      .map((v) => v.color as string);
    return [...new Set(colors)];
  }, [variants]);

  const availableSizes = useMemo(() => {
    const sizes = variants
      .filter((v) => v.size && v.active !== false)
      .map((v) => v.size as string);
    return [...new Set(sizes)];
  }, [variants]);

  // Fallback to product colors/sizes
  const displayColors = availableColors.length > 0 ? availableColors : product?.colors || [];
  const displaySizes = availableSizes.length > 0 ? availableSizes : product?.sizes || [];

  // Initialize selection
  useEffect(() => {
    if (product) {
      setSelectedColor(displayColors[0] || '');
      setSelectedSize(displaySizes[0] || '');
      setQuantity(1);
      setSelectedImage(0);
    }
  }, [product, displayColors, displaySizes]);

  // Find selected variant
  const selectedVariant = useMemo(() => {
    return variants.find((v) => {
      const colorMatch = v.color === selectedColor;
      const sizeMatch = displaySizes.length > 0 ? v.size === selectedSize : true;
      return colorMatch && sizeMatch;
    });
  }, [variants, selectedColor, selectedSize, displaySizes]);

  const stock = selectedVariant?.stock ?? product?.stock ?? 10;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    onAddToCart(
      product,
      selectedColor,
      displaySizes.length > 0 ? selectedSize : undefined,
      selectedVariant?.id
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % 1);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + 1) % 1);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl overflow-hidden max-w-5xl w-full max-h-[90vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <X size={20} className="text-[#6B4423]" />
        </button>

        <div className="grid md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative bg-[#FDF8F4]">
            {/* Main Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Navigation arrows - for future multi-image support */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 hover:opacity-100"
              >
                <ChevronLeft size={20} className="text-[#6B4423]" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 hover:opacity-100"
              >
                <ChevronRight size={20} className="text-[#6B4423]" />
              </button>

              {/* Zoom hint */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ZoomIn size={18} className="text-[#6B4423]" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span
                    className={`text-xs font-bold tracking-wide px-3 py-1.5 rounded-full ${
                      product.is_sale
                        ? 'bg-[#D4A59A] text-white'
                        : product.is_new
                        ? 'bg-[#8B7355] text-white'
                        : 'bg-white text-[#6B4423]'
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
                {isLowStock && (
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
                    ¡Últimas {stock}!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto">
            {/* Content */}
            <div className="flex-1 p-6 md:p-8">
              {/* Category */}
              <p className="text-xs text-[#D4A59A] font-semibold uppercase tracking-widest mb-2">
                {product.category}
              </p>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#6B4423] mb-4">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? 'text-[#D4A59A] fill-[#D4A59A]'
                          : 'text-[#E8D4C4]'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-[#8B7355]">
                  {product.rating} ({product.reviews.toLocaleString()} reseñas)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-[#6B4423]">
                  ${product.price} MXN
                </span>
                {product.original_price && (
                  <>
                    <span className="text-lg text-[#B89B8A] line-through">
                      ${product.original_price}
                    </span>
                    <span className="text-sm font-bold bg-red-100 text-red-600 px-2 py-1 rounded-lg">
                      -{discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#8B7355] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Color Selection */}
              {displayColors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#6B4423] mb-3">
                    Color: <span className="font-normal text-[#8B7355]">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {displayColors.map((color) => {
                      const bg = COLOR_MAP[color] || color.toLowerCase();
                      const isSelected = selectedColor === color;

                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: bg }}
                          className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                            isSelected
                              ? 'border-[#D4A59A] ring-2 ring-[#D4A59A]/30'
                              : 'border-[#E8D4C4] hover:border-[#D4A59A]'
                          }`}
                          title={color}
                        >
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="w-4 h-4 bg-white rounded-full" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {displaySizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#6B4423] mb-3">
                    Talla:{' '}
                    <span className="font-normal text-[#8B7355]">{selectedSize || 'Seleccionar'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {displaySizes.map((size) => {
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-[#D4A59A] bg-[#FDF0ED] text-[#6B4423]'
                              : 'border-[#E8D4C4] text-[#8B7355] hover:border-[#D4A59A]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-[#6B4423] mb-3">Cantidad</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-[#F9F5F1] rounded-xl p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Minus size={16} className="text-[#8B7355]" />
                    </button>
                    <span className="w-12 text-center font-semibold text-[#6B4423]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      disabled={quantity >= stock}
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                    >
                      <Plus size={16} className="text-[#8B7355]" />
                    </button>
                  </div>
                  <span className="text-sm text-[#8B7355]">
                    {stock} disponibles
                  </span>
                </div>
              </div>

              {/* Stock warning */}
              {isOutOfStock && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-red-600 font-medium">
                    Este producto está agotado
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 md:p-8 border-t border-[#E8D4C4] bg-white">
              <div className="flex gap-3">
                <button
                  onClick={handleWishlist}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all ${
                    isInWishlist(product.id)
                      ? 'border-[#D4A59A] bg-[#FDF0ED] text-[#D4A59A]'
                      : 'border-[#E8D4C4] text-[#8B7355] hover:border-[#D4A59A]'
                  }`}
                >
                  <Heart
                    size={22}
                    fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                  />
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={added || isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold tracking-wide transition-all ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : added
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] text-white hover:from-[#8B7355] hover:to-[#A08278] hover:shadow-lg'
                  }`}
                >
                  <ShoppingBag size={20} />
                  {isOutOfStock
                    ? 'Agotado'
                    : added
                    ? '¡Agregado!'
                    : 'Agregar al carrito'}
                </button>
              </div>

              {/* Quick info */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                  <Truck size={16} className="text-[#D4A59A]" />
                  <span>Envío gratis +$999</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                  <Shield size={16} className="text-[#D4A59A]" />
                  <span>Pago seguro</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                  <RotateCcw size={16} className="text-[#D4A59A]" />
                  <span>30 días</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
