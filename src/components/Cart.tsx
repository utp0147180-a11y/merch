import { X, ShoppingBag, Trash2, Plus, Minus, Check } from 'lucide-react';
import { CartItem, User } from '../types';
import { FREE_SHIPPING_THRESHOLD } from '../data';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, color: string, delta: number) => void;
  onRemove: (id: number, color: string) => void;
  onCheckout: () => void;
  user: User | null;
  onAuthOpen: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  user,
  onAuthOpen,
}: CartProps) {

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 149;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#FDF8F4] z-50 flex flex-col shadow-2xl transition-transform duration-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >

        <div className="flex items-center justify-between p-5 bg-white border-b border-[#E8D4C4]">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-[#D4A59A]" />
            <div>
              <h2 className="font-semibold text-[#6B4423]">
                Mi Carrito
              </h2>
              <p className="text-xs text-[#B89B8A]">
                {items.reduce((s,i)=>s+i.quantity,0)} productos
              </p>
            </div>
          </div>

          <button onClick={onClose}>
            <X size={18}/>
          </button>
        </div>


        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {items.map(item => (

            <div
              key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
              className="flex gap-3 bg-white rounded-2xl p-3 shadow"
            >

              <img
                src={item.image}
                className="w-20 h-24 rounded-xl object-cover"
              />

              <div className="flex-1">

                <p className="font-semibold text-[#6B4423]">
                  {item.name}
                </p>

                <div className="flex gap-2 items-center mt-2">

                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{
                      backgroundColor:item.selectedColor
                    }}
                  />

                  {item.selectedSize && (
                    <span className="text-xs">
                      Talla: {item.selectedSize}
                    </span>
                  )}

                </div>


                <p className="font-bold mt-2">
                  ${item.price * item.quantity} MXN
                </p>


                <div className="flex gap-2 mt-2">

                  <button
                    onClick={()=>onUpdateQuantity(item.id,item.selectedColor,-1)}
                  >
                    <Minus size={14}/>
                  </button>


                  <span>
                    {item.quantity}
                  </span>


                  <button
                    onClick={()=>onUpdateQuantity(item.id,item.selectedColor,1)}
                  >
                    <Plus size={14}/>
                  </button>


                  <button
                    onClick={()=>onRemove(item.id,item.selectedColor)}
                  >
                    <Trash2 size={14}/>
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>


        {items.length > 0 && (

          <div className="bg-white border-t p-5 space-y-3">


            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal} MXN</span>
            </div>


            <div className="flex justify-between">
              <span>Envío</span>
              <span>
                {shipping === 0 ? 'GRATIS' : `$${shipping} MXN`}
              </span>
            </div>


            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>
                ${subtotal + shipping} MXN
              </span>
            </div>


            <button
              onClick={user ? onCheckout : onAuthOpen}
              className="w-full bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] text-white py-4 rounded-xl font-semibold"
            >
              {user 
                ? 'Realizar pedido'
                : 'Iniciar sesión para continuar'}
            </button>


            <button
              onClick={onClose}
              className="w-full text-sm text-[#8B7355]"
            >
              Seguir comprando
            </button>


          </div>

        )}

      </aside>
    </>
  );
}