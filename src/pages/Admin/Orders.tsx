import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

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
          </div>
        ))}
      </div>
    </div>
  );
}