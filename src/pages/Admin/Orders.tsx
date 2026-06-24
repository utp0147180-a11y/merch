import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total,
        shipping,
        status,
        created_at,
        users (
          full_name,
          email,
          phone,
          address
        ),
        order_items (
          product_name,
          price,
          quantity,
          color,
          size
        )
      `)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    else console.log(error);
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.log(error);
      return;
    }

    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF8F4] p-8">
      <h1 className="text-3xl font-bold text-[#6B4423] mb-8">
        Pedidos
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            <p className="font-bold">
              {order.order_number}
            </p>

            <p>
              {order.users?.full_name} - {order.users?.email}
            </p>

            <p className="mb-3">
              Total: ${order.total}
            </p>

            <select
              value={order.status}
              onChange={(e) =>
                updateStatus(order.id, e.target.value)
              }
              className="border rounded-lg px-3 py-2"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="pagado">Pagado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <button
              onClick={() => setSelectedOrder(order)}
              className="ml-3 bg-[#6B4423] text-white px-4 py-2 rounded-lg"
            >
              Ver detalle
            </button>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">

            <h2 className="text-2xl font-bold text-[#6B4423] mb-4">
              Pedido {selectedOrder.order_number}
            </h2>

            <p>
              <b>Cliente:</b> {selectedOrder.users?.full_name}
            </p>

            <p>
              <b>Email:</b> {selectedOrder.users?.email}
            </p>

            <p>
              <b>Teléfono:</b> {selectedOrder.users?.phone}
            </p>

            <p>
              <b>Dirección:</b> {selectedOrder.users?.address}
            </p>

            <hr className="my-4" />

            <h3 className="font-bold mb-2">
              Productos:
            </h3>

            {selectedOrder.order_items?.map((item: any, index: number) => (
              <div key={index} className="mb-2">
                <p>
                  {item.product_name}
                </p>

                <p className="text-sm text-gray-600">
                  Cantidad: {item.quantity} |
                  Color: {item.color} |
                  Talla: {item.size}
                </p>
              </div>
            ))}

            <p className="font-bold mt-4">
              Total: ${selectedOrder.total}
            </p>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-5 bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              Cerrar
            </button>

          </div>
        </div>
      )}
    </div>
  );
}