import { useState } from 'react';
import { X, ShoppingBag, CheckCircle, MapPin, Phone, Mail, User } from 'lucide-react';
import { CartItem, User as UserType, Order } from '../types';
import { FREE_SHIPPING_THRESHOLD, ORDER_EMAIL, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../data';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: UserType;
  onOrderComplete: (order: Order) => void;
}

export default function CheckoutModal({ isOpen, onClose, items, user, onOrderComplete }: CheckoutModalProps) {
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 149;
  const total = subtotal + shipping;

  const handleConfirm = async () => {
    setLoading(true);

    const newOrderNumber = `#${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    setOrderNumber(newOrderNumber);

    // Create order object
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: newOrderNumber,
      userId: user.id,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize,
      })),
      total,
      shipping,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Simulate sending email (in production, this would be an API call)
    const emailBody = `
      NUEVO PEDIDO - MERCH RAY
      ========================

      Número de pedido: ${newOrderNumber}

      CLIENTE:
      - Nombre: ${user.fullName}
      - Teléfono: ${user.phone}
      - Email: ${user.email}
      - Dirección: ${user.address}

      PRODUCTOS:
      ${items.map(item => `
      • ${item.name}
        - Color: ${item.selectedColor}
        ${item.selectedSize ? `- Talla: ${item.selectedSize}` : ''}
        - Cantidad: ${item.quantity}
        - Precio unitario: $${item.price} MXN
        - Subtotal: $${item.price * item.quantity} MXN
      `).join('')}

      TOTALES:
      - Subtotal: $${subtotal} MXN
      - Envío: ${shipping === 0 ? 'GRATIS' : `$${shipping} MXN`}
      - TOTAL: $${total} MXN

      Fecha: ${new Date().toLocaleString('es-MX')}
    `;

    // Log for demo purposes (send to email in production)
    console.log('Sending order to:', ORDER_EMAIL);
    console.log(emailBody);

    // Save to state
    setTimeout(() => {
      onOrderComplete(order);
      setLoading(false);
      setStep('success');
    }, 1200);
  };

  const handleClose = () => {
    setStep('confirm');
    setLoading(false);
    onClose();
  };

  const handleWhatsApp = () => {
    const message = `Hola, vengo de Merch Ray y quiero información de mi pedido ${orderNumber}.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {step === 'confirm' && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#E8D4C4]">
                <div>
                  <h2 className="text-xl font-bold text-[#6B4423] font-serif">Confirmar Pedido</h2>
                  <p className="text-xs text-[#B89B8A] mt-1">Revisa tu orden antes de continuar</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5EDE5] transition-colors"
                >
                  <X size={18} className="text-[#8B7355]" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="bg-gradient-to-r from-[#FDF0ED] to-[#F5EDE5] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[#6B4423]">
                    <User size={14} className="text-[#D4A59A]" />
                    <span className="font-semibold text-sm">{user.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                    <Phone size={12} className="text-[#B89B8A]" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                    <Mail size={12} className="text-[#B89B8A]" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#8B7355]">
                    <MapPin size={12} className="text-[#B89B8A] flex-shrink-0 mt-0.5" />
                    <span>{user.address}</span>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-xs font-semibold text-[#6B4423] uppercase tracking-wider mb-3">Productos ({items.length})</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.selectedColor}`} className="flex gap-3 bg-[#FDF8F4] rounded-xl p-2.5">
                        <div className="w-14 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#6B4423] truncate">{item.name}</p>
                          <p className="text-[10px] text-[#B89B8A]">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                            {item.selectedSize && `Talla: ${item.selectedSize} • `}
                            Cant: {item.quantity}
                          </p>
                          <p className="text-xs font-bold text-[#6B4423] mt-1">${item.price * item.quantity} MXN</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-[#E8D4C4] pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-[#8B7355]">
                    <span>Subtotal</span>
                    <span>${subtotal} MXN</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8B7355]">Envío</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'text-[#6B4423]'}>
                      {shipping === 0 ? 'GRATIS' : `$${shipping} MXN`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#6B4423] text-base pt-2 border-t border-[#F5EDE5]">
                    <span>Total</span>
                    <span>${total} MXN</span>
                  </div>
                </div>

                {/* Payment notice */}
                <div className="bg-[#FFF8E7] rounded-xl p-3 flex items-start gap-2">
                  <ShoppingBag size={14} className="text-[#D4A59A] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#8B7355] leading-relaxed">
                    <span className="font-semibold">Método de pago:</span> Transferencia o depósito bancario.
                    Un asesor te contactará por WhatsApp para confirmar tu pedido.
                  </p>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] text-white rounded-xl font-semibold text-sm hover:from-[#8B7355] hover:to-[#A08278] transition-all duration-300 hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Realizar pedido
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#6B4423] font-serif mb-2">¡Pedido Exitoso!</h2>
              <p className="text-[#8B7355] text-sm mb-4">Tu pedido fue creado correctamente.</p>

              <div className="bg-gradient-to-r from-[#FDF0ED] to-[#F5EDE5] rounded-2xl p-4 mb-6">
                <p className="text-xs text-[#B89B8A] mb-1">Número de pedido</p>
                <p className="text-2xl font-bold text-[#6B4423]">{orderNumber}</p>
              </div>

              <p className="text-xs text-[#8B7355] mb-6 leading-relaxed">
                En breve un asesor Merch Ray se pondrá en contacto contigo por WhatsApp para confirmar tu pedido y enviarte los datos de pago.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3 bg-[#25D366] text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.432-9.884 9.884-9.884 2.635 0 5.11 1.027 6.974 2.89a9.825 9.825 0 012.889 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Ir a WhatsApp
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 border border-[#D4A59A] text-[#8B7355] rounded-xl font-semibold text-sm hover:bg-[#FDF0ED] transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
