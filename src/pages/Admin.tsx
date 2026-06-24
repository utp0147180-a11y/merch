import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [orders, setOrders] = useState([]);

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

    if (!error) {
      setOrders(data);
    } else {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF8F4] p-8">
      <h1 className="text-3xl font-bold text-[#6B4423] mb-8">
        Panel Administrativo
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">Productos</h2>
          <p className="text-gray-600 mb-4">
            Administrar catálogo de productos.
          </p>
          <button className="bg-[#6B4423] text-white px-4 py-2 rounded-lg">
            Gestionar
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">Pedidos</h2>
          <p className="text-gray-600 mb-4">
            Revisar pedidos de clientes.
          </p>
          <button className="bg-[#6B4423] text-white px-4 py-2 rounded-lg">
            Ver pedidos
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">Dashboard</h2>
          <p className="text-gray-600 mb-4">
            Métricas y ventas.
          </p>
          <button className="bg-[#6B4423] text-white px-4 py-2 rounded-lg">
            Abrir
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#6B4423] mb-4">
          Últimos pedidos
        </h2>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <p className="font-semibold">
                {order.order_number}
              </p>

              <p className="text-sm text-gray-600">
                {order.users?.full_name} - {order.users?.email}
              </p>

              <p className="text-sm">
                Total: ${order.total} | Status: {order.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}