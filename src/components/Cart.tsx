import { X, ShoppingBag, Trash2, Plus, Minus, Check } from 'lucide-react';
import { CartItem, User, Product } from '../types';
import { FREE_SHIPPING_THRESHOLD } from '../data';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  products?: Product[];
  onUpdateQuantity: (id: number, color: string, size: string | undefined, delta: number) => void;
  onRemove: (id: number, color: string, size?: string) => void;
  onCheckout: () => void;
  user: User | null;
  onAuthOpen: () => void;
  getStock?: (productId: number, color: string, size?: string) => number;
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

export default function Cart({
  isOpen,
  onClose,
  items,
  products,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  user,
  onAuthOpen,
  getStock,
}: CartProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 149;

  // Get variant stock - use passed function or fallback
  const getVariantStock = (item: CartItem): number => {
    if (getStock) {
      return getStock(item.id, item.selectedColor, item.selectedSize);
    }

    const product = products?.find((p) => p.id === item.id);
    if (!product?.product_variants) return 0;

    const variant = product.product_variants.find((v) => {
      const colorMatch = v.color === item.selectedColor;
      const sizeMatch = item.selectedSize ? v.size === item.selectedSize : !v.size;
      return colorMatch && sizeMatch;
    });

    return variant?.stock ?? 0;
  };

  // Get color display value
  const getColorDisplay = (colorName: string): string => {
    return COLOR_MAP[colorName] || colorName.toLowerCase();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#FDF8F4] z-50 flex flex-col shadow-2xl transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-[#E8D4C4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FDF0ED] rounded-full flex items-center justify-center">
              <ShoppingBag size={18} className="text-[#D4A59A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#6B4423]">Mi Carrito</h2>
              {items.length > 0 && (
                <p className="text-xs text-[#B89B8A]">
                  {items.reduce((s, i) => s + i.quantity, 0)} productos
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5EDE5] transition-colors"
          >
            <X size={18} className="text-[#8B7355]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-24 h-24 bg-[#F5EDE5] rounded-full flex items-center justify-center mb-4 animate-float">
                <ShoppingBag size={36} className="text-[#D4A59A]" />
              </div>
              <p className="font-semibold text-[#6B4423] mb-1">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-[#B89B8A] mb-6">
                Agrega productos para comenzar
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#D4A59A] text-white rounded-full text-sm font-semibold hover:bg-[#CDA89C] transition-colors"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            items.map((item) => {
              const stock = getVariantStock(item);
              const isMaxStock = item.quantity >= stock;

              return (
                <div
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize || 'no-size'}`}
                  className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-[#F5EDE5] hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#FDF8F4]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[10px] text-[#D4A59A] font-semibold uppercase tracking-wider">
                      {item.category}
                    </p>
                    <p className="text-sm font-semibold text-[#6B4423] leading-tight mt-0.5 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-4 h-4 rounded-full border border-[#E8D4C4]"
                        style={{ backgroundColor: getColorDisplay(item.selectedColor) }}
                        title={item.selectedColor}
                      />
                      {item.selectedSize && (
                        <span className="text-[10px] text-[#B89B8A]">
                          Talla: {item.selectedSize}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-[#6B4423] text-sm">
                        ${item.price * item.quantity} MXN
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              item.selectedColor,
                              item.selectedSize,
                              -1
                            )
                          }
                          className="w-7 h-7 rounded-full bg-[#F5EDE5] flex items-center justify-center hover:bg-[#E8D4C4] transition-colors"
                        >
                          <Minus size={10} className="text-[#8B7355]" />
                        </button>
                        <span className="text-sm font-semibold text-[#6B4423] w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.id,
                              item.selectedColor,
                              item.selectedSize,
                              1
                            )
                          }
                          disabled={isMaxStock}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isMaxStock
                              ? 'bg-gray-100 cursor-not-allowed'
                              : 'bg-[#F5EDE5] hover:bg-[#E8D4C4]'
                          }`}
                          title={isMaxStock ? `Máximo ${stock} disponibles` : ''}
                        >
                          <Plus
                            size={10}
                            className={isMaxStock ? 'text-gray-300' : 'text-[#8B7355]'}
                          />
                        </button>
                        <button
                          onClick={() =>
                            onRemove(item.id, item.selectedColor, item.selectedSize)
                          }
                          className="w-7 h-7 rounded-full bg-[#FDF0ED] flex items-center justify-center hover:bg-red-50 transition-colors ml-1 group"
                        >
                          <Trash2
                            size={10}
                            className="text-[#B89B8A] group-hover:text-red-400"
                          />
                        </button>
                      </div>
                    </div>
                    {isMaxStock && stock <= 10 && (
                      <p className="text-[10px] text-orange-500 mt-1">
                        Máximo {stock} disponibles
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E8D4C4] bg-white p-5 space-y-3">
            {/* Free shipping progress */}
            {subtotal < FREE_SHIPPING_THRESHOLD && (
              <div className="bg-[#FDF0ED] rounded-xl p-3">
                <p className="text-xs text-[#8B7355] mb-2">
                  Agrega{' '}
                  <span className="font-bold">
                    ${FREE_SHIPPING_THRESHOLD - subtotal}
                  </span>{' '}
                  más para envío gratis
                </p>
                <div className="h-2 bg-[#E8D4C4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4A59A] to-[#8B7355] rounded-full transition-all duration-500"
                    style={{
                      width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 text-xs rounded-xl p-3">
                <Check size={14} className="text-green-600" />
                <span>¡Felicidades! Tienes envío gratis</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-[#8B7355]">
              <span>Subtotal</span>
              <span>${subtotal} MXN</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8B7355]">Envío</span>
              <span
                className={
                  shipping === 0
                    ? 'text-green-600 font-semibold'
                    : 'text-[#6B4423]'
                }
              >
                {shipping === 0 ? 'GRATIS' : `$${shipping} MXN`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[#6B4423] text-lg pt-2 border-t border-[#F5EDE5]">
              <span>Total</span>
              <span>${subtotal + shipping} MXN</span>
            </div>

            <button
              onClick={user ? onCheckout : onAuthOpen}
              className="w-full bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] hover:from-[#8B7355] hover:to-[#A08278] text-white py-4 rounded-xl font-semibold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[#D4A59A]/30 mt-2"
            >
              {user ? 'Realizar pedido' : 'Iniciar sesión para continuar'}
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-[#8B7355] hover:text-[#D4A59A] transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
