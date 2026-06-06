import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { saveOrder } from '../lib/supabase';
import { CartItem, User as UserType } from '../types';
import { FREE_SHIPPING_THRESHOLD, WHATSAPP_NUMBER } from '../data';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: UserType;
  clearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  user,
  clearCart
}: CheckoutModalProps) {

  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((a, b) => a + b.price * b.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 149;
  const total = subtotal + shipping;

  const handleConfirm = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const snapshotItems = [...items];

      const savedOrder = await saveOrder(
        '',
        user,
        snapshotItems,
        total,
        shipping
      );

      if (!savedOrder) {
        throw new Error('No se pudo crear la orden');
      }

      const number =
        (savedOrder as any)?.orderNumber ||
        (savedOrder as any)?.order_number ||
        '';

      setOrderNumber(number);
      setStep('success');

      // limpiar carrito después de mostrar success
      setTimeout(() => {
        clearCart?.();
      }, 300);

    } catch (err) {
      console.error('CHECKOUT ERROR:', err);
      alert('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setOrderNumber('');
    setLoading(false);
    clearCart?.();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">

          {step === 'confirm' && (
            <>
              <h2 className="text-lg font-bold">Confirmar pedido</h2>

              <p className="text-sm mt-2">{user.fullName}</p>
              <p className="text-sm">{user.email}</p>

              <p className="mt-4 font-bold">
                Total: ${total} MXN
              </p>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full mt-5 bg-black text-white py-3 rounded-xl"
              >
                {loading ? 'Procesando...' : 'Realizar pedido'}
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="text-center">
              <CheckCircle
                className="mx-auto text-green-500"
                size={60}
              />

              <h2 className="font-bold text-2xl mt-4">
                ¡Pedido Exitoso!
              </h2>

              <p className="mt-4 text-gray-600">
                Número de pedido:
              </p>

              <p className="text-2xl font-bold text-[#6B4423] mt-1">
                {orderNumber}
              </p>

              <p className="mt-5 text-sm text-gray-600 leading-relaxed">
                En breve un asesor de <strong>Merch Ray</strong> se pondrá en contacto contigo por WhatsApp.
              </p>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-6 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
              >
                Ir a WhatsApp
              </a>

              <button
                onClick={handleClose}
                className="mt-3 w-full border border-gray-300 py-3 rounded-xl font-medium"
              >
                Continuar comprando
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}