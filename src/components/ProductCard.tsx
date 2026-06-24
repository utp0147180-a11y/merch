import { useState } from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size?: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || ''
  );

  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || ''
  );

  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  function handleAdd() {
    onAddToCart(product, selectedColor, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
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

        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
              product.isSale
                ? 'bg-[#D4A59A] text-white'
                : product.isNew
                ? 'bg-[#8B7355] text-white'
                : 'bg-white/90 text-[#6B4423]'
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
            liked
              ? 'bg-[#D4A59A] text-white scale-110'
              : 'bg-white/80 text-[#B89B8A] hover:bg-white hover:text-[#D4A59A] hover:scale-110'
          }`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
        </button>

        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 transition-all duration-500 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#6B4423] text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all">
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

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-[#6B4423]">
            ${product.price} MXN
          </span>

          {product.originalPrice && (
            <>
              <span className="text-xs text-[#B89B8A] line-through">
                ${product.originalPrice}
              </span>
              <span className="text-[10px] font-bold text-[#D4A59A] bg-[#FDF0ED] px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          {product.colors?.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                selectedColor === color
                  ? 'border-[#D4A59A] scale-110 shadow-md'
                  : 'border-transparent hover:scale-110'
              }`}
            />
          ))}
        </div>

        {product.sizes?.length ? (
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-[10px] px-3 py-1 rounded-lg border font-medium transition-all ${
                  selectedSize === size
                    ? 'border-[#D4A59A] bg-[#FDF0ED] text-[#8B7355]'
                    : 'border-[#E8D4C4] text-[#B89B8A] hover:border-[#D4A59A]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        ) : null}

        <button
          onClick={handleAdd}
          disabled={added}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-500 ${
            added
              ? 'bg-[#8B7355] text-white scale-[0.98]'
              : 'bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] hover:from-[#8B7355] hover:to-[#A08278] text-white hover:shadow-lg hover:shadow-[#D4A59A]/30 active:scale-[0.98]'
          }`}
        >
          <ShoppingBag size={14} className={added ? 'animate-bounce' : ''} />
          {added ? '¡Agregado!' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}