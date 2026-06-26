import { X, Heart, ShoppingBag, Trash2, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemove: (productId: number) => void;
  onAddToCart: (product: Product, color: string, size?: string) => void;
  getStock?: (productId: number, color: string, size?: string) => number;
  isInStock?: (productId: number, color?: string, size?: string) => boolean;
}

export default function WishlistModal({
  isOpen,
  onClose,
  products,
  onRemove,
  onAddToCart,
  getStock,
  isInStock,
}: WishlistModalProps) {
  if (!isOpen) return null;

  const isProductInStock = (product: Product): boolean => {
    if (isInStock) {
      return isInStock(product.id);
    }
    if (product.product_variants && product.product_variants.length > 0) {
      return product.product_variants.some((v) => v.active !== false && v.stock > 0);
    }
    return (product.stock ?? 0) > 0;
  };

  const handleAddToCart = (product: Product) => {
    if (!isProductInStock(product)) return;

    const variant = product.product_variants?.find((v) => v.stock > 0);
    const color = variant?.color || product.colors?.[0] || '';
    const size = variant?.size || product.sizes?.[0];

    if (color) {
      onAddToCart(product, color, size);
    }
  };

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
              {products.map((product) => {
                const inStock = isProductInStock(product);
                const stockCount = product.product_variants?.reduce(
                  (sum, v) => sum + Math.max(0, v.stock),
                  product.stock || 0
                ) || 0;

                return (
                  <div
                    key={product.id}
                    className={`bg-[#FDF8F4] rounded-xl overflow-hidden border border-[#E8D4C4] ${
                      !inStock ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="bg-white/90 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
                            Agotado
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => onRemove(product.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>

                      {/* Low stock indicator */}
                      {inStock && stockCount > 0 && stockCount <= 5 && (
                        <div className="absolute top-2 left-2 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full">
                          ¡Solo {stockCount}!
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[#D4A59A] mb-1">{product.category}</p>
                      <p className="text-sm font-medium text-[#6B4423] line-clamp-1">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="font-bold text-[#6B4423]">
                            ${product.price}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-[#B89B8A] line-through ml-1">
                              ${product.original_price}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!inStock}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                            inStock
                              ? 'bg-[#D4A59A] hover:bg-[#8B7355]'
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                          title={inStock ? 'Agregar al carrito' : 'Agotado'}
                        >
                          <ShoppingBag size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
