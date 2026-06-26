import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemove: (productId: number) => void;
  onAddToCart: (product: Product, color: string, size?: string) => void;
}

export default function WishlistModal({
  isOpen,
  onClose,
  products,
  onRemove,
  onAddToCart,
}: WishlistModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D4C4]">
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-[#D4A59A]" fill="#D4A59A" />
            <div>
              <h2 className="font-semibold text-[#6B4423]">Mis Favoritos</h2>
              <p className="text-xs text-[#B89B8A]">{products.length} productos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-[#F5EDE5] flex items-center justify-center"
          >
            <X size={20} className="text-[#8B7355]" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Heart size={48} className="text-[#E8D4C4] mb-4" />
              <p className="text-lg font-semibold text-[#6B4423] mb-1">
                Tu lista está vacía
              </p>
              <p className="text-sm text-[#B89B8A]">
                Guarda tus productos favoritos aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#FDF8F4] rounded-xl overflow-hidden border border-[#E8D4C4]"
                >
                  <div className="aspect-square relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onRemove(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#D4A59A] mb-1">{product.category}</p>
                    <p className="text-sm font-medium text-[#6B4423] line-clamp-1">
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-[#6B4423]">
                        ${product.price}
                      </span>
                      <button
                        onClick={() => {
                          const color = product.colors?.[0] || '';
                          const size = product.sizes?.[0];
                          onAddToCart(product, color, size);
                        }}
                        className="w-8 h-8 bg-[#D4A59A] rounded-full flex items-center justify-center text-white hover:bg-[#8B7355] transition-colors"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
