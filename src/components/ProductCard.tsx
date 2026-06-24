import { useState } from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: any;
  onAddToCart: (product: any, variant: any) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {

  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const variants = product.product_variants || [];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  function handleAdd() {
    if (!selectedVariant) return;
    onAddToCart(product, selectedVariant);
  }

  return (
    <div
      className="group relative bg-white rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#F5EDE5]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* IMAGE */}
      <div className="relative overflow-hidden bg-[#FDF8F4] aspect-[3/4]">
        <img
          src={product.image}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            hovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* WISHLIST */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* INFO */}
      <div className="p-4">

        <p className="text-xs text-[#D4A59A]">{product.category}</p>

        <h3 className="font-semibold text-[#6B4423]">
          {product.name}
        </h3>

        <p className="font-bold mt-1">
          ${product.price}
        </p>

        {/* VARIANTS - COLORS + SIZES */}
        <div className="mt-3 flex flex-wrap gap-2">

          {variants.map((v: any, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedVariant(v)}
              className={`text-[10px] px-2 py-1 rounded border ${
                selectedVariant?.color === v.color &&
                selectedVariant?.size === v.size
                  ? 'bg-[#D4A59A] text-white'
                  : 'bg-white'
              }`}
            >
              {v.color} {v.size ? `- ${v.size}` : ''}
            </button>
          ))}

        </div>

        {/* ADD */}
        <button
          onClick={handleAdd}
          className="w-full mt-3 bg-[#6B4423] text-white py-2 rounded-lg"
        >
          Agregar al carrito
        </button>

      </div>
    </div>
  );
}