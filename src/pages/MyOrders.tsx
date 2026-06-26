import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import {
  Package,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total: number;
  shipping: number;
  status: string;
  created_at: string;
  tracking_number?: string;
  estimated_delivery?: string;
  order_items: {
    id: string;
    product_name: string;
    price: number;
    quantity: number;
    color: string;
    size: string;
  }[];
  users: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; label: string; color: string; bg: string }> = {
  pendiente: {
    icon: Clock,
    label: 'Pendiente',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  confirmado: {
    icon: AlertCircle,
    label: 'Confirmado',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  preparando: {
    icon: Package,
    label: 'Preparando',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  enviado: {
    icon: Truck,
    label: 'Enviado',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  entregado: {
    icon: CheckCircle,
    label: 'Entregado',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  cancelado: {
    icon: XCircle,
    label: 'Cancelado',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
};

interface MyOrdersProps {
  user: User;
  onClose?: () => void;
}

export default function MyOrders({ user, onClose }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        total,
        shipping,
        status,
        created_at,
        tracking_number,
        estimated_delivery,
        order_items (
          id,
          product_name,
          price,
          quantity,
          color,
          size
        ),
        users (
          full_name,
          email,
          phone,
          address
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status] || {
        icon: Clock,
        label: status,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4A59A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8D4C4] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#6B4423]">Mis Pedidos</h1>
              <p className="text-xs text-[#B89B8A]">{orders.length} pedidos</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-sm text-[#8B7355] hover:text-[#D4A59A] transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-[#F5EDE5] rounded-full flex items-center justify-center mb-4">
              <Package size={40} className="text-[#D4A59A]" />
            </div>
            <p className="text-lg font-semibold text-[#6B4423] mb-1">
              No tienes pedidos aún
            </p>
            <p className="text-sm text-[#B89B8A]">
              Cuando realices compras, aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E8D4C4] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-[#F5EDE5]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}
                        >
                          <StatusIcon size={24} className={statusConfig.color} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#6B4423]">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-[#B89B8A]">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-[#6B4423]">
                          ${order.total} MXN
                        </p>
                        <span
                          className={`text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.order_items.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="text-sm text-[#6B4423] line-clamp-1">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-[#B89B8A]">
                              {item.color}
                              {item.size && ` | ${item.size}`}
                              {' | '}x{item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-[#6B4423]">
                            ${item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                      {order.order_items.length > 2 && (
                        <p className="text-xs text-[#D4A59A]">
                          +{order.order_items.length - 2} productos más
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border border-[#E8D4C4] rounded-xl text-sm font-medium text-[#8B7355] hover:bg-[#FDF8F4] transition-colors"
                    >
                      Ver detalles
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[#E8D4C4]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#6B4423]">
                    Pedido {selectedOrder.order_number}
                  </h2>
                  <p className="text-xs text-[#B89B8A]">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full hover:bg-[#F5EDE5] flex items-center justify-center"
                >
                  <X size={18} className="text-[#8B7355]" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Status */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#D4A59A] uppercase tracking-wider mb-3">
                  Estado del pedido
                </p>
                <div className="flex items-center gap-3 p-3 bg-[#FDF8F4] rounded-xl">
                  <StatusIcon
                    size={20}
                    className={getStatusConfig(selectedOrder.status).color}
                  />
                  <span className="font-medium text-[#6B4423]">
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#D4A59A] uppercase tracking-wider mb-3">
                  Productos
                </p>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start py-2 border-b border-[#F5EDE5]"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#6B4423]">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-[#B89B8A]">
                          {item.color}
                          {item.size && ` | ${item.size}`}
                        </p>
                        <p className="text-xs text-[#B89B8A]">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#6B4423]">
                        ${item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-[#D4A59A] uppercase tracking-wider mb-3">
                  Resumen
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B7355]">Subtotal</span>
                    <span className="text-[#6B4423]">
                      ${selectedOrder.total - selectedOrder.shipping}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B7355]">Envío</span>
                    <span className="text-[#6B4423]">
                      {selectedOrder.shipping === 0
                        ? 'GRATIS'
                        : `$${selectedOrder.shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#E8D4C4]">
                    <span className="text-[#6B4423]">Total</span>
                    <span className="text-[#6B4423]">${selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-xs font-semibold text-[#D4A59A] uppercase tracking-wider mb-3">
                  Información de envío
                </p>
                <div className="p-3 bg-[#FDF8F4] rounded-xl space-y-1">
                  <p className="text-sm font-medium text-[#6B4423]">
                    {selectedOrder.users?.full_name}
                  </p>
                  <p className="text-xs text-[#8B7355]">
                    {selectedOrder.users?.phone}
                  </p>
                  <p className="text-xs text-[#8B7355]">
                    {selectedOrder.users?.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import X icon
import { X } from 'lucide-react';
