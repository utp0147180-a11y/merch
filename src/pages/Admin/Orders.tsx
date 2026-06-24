import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 🔥 FILTROS
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortOrder, setSortOrder] = useState("desc");

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

      {/* 🔥 FILTROS */}
      <div className="flex gap-3 mb-6">

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="pagado">Pagado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="desc">Más recientes</option>
          <option value="asc">Más antiguos</option>
        </select>

      </div>

      <div className="space-y-4">
        {orders
          .filter((order) => {
            if (statusFilter === "todos") return true;
            return order.status === statusFilter;
          })
          .sort((a, b) => {
            if (sortOrder === "desc") {
              return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
              );
            } else {
              return (
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
              );
            }
          })
          .map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <p className="font-bold">
                {order.order_number}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
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

      {/* 🔥 MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <h2 className="text-2xl font-bold text-[#6B4423] mb-4">
              Pedido {selectedOrder.order_number}
            </h2>

            <p className="text-sm text-gray-500 mb-2">
              Fecha del pedido:{" "}
              {new Date(selectedOrder.created_at).toLocaleString()}
            </p>

            <p><b>Cliente:</b> {selectedOrder.users?.full_name}</p>
            <p><b>Email:</b> {selectedOrder.users?.email}</p>
            <p><b>Teléfono:</b> {selectedOrder.users?.phone}</p>
            <p><b>Dirección:</b> {selectedOrder.users?.address}</p>

            <hr className="my-4" />

            <h3 className="font-bold mb-3">
              Productos:
            </h3>

            {selectedOrder.order_items?.map((item: any, index: number) => (
              <div key={index} className="border-b pb-3 mb-3">
                <p className="font-semibold">
                  {item.product_name}
                </p>

                <p className="text-sm text-gray-600">
                  Cantidad: {item.quantity}
                </p>

                <p className="text-sm text-gray-600">
                  Precio unitario: ${item.price}
                </p>

                <p className="font-medium">
                  Subtotal: ${item.price * item.quantity}
                </p>

                <p className="text-sm text-gray-600">
                  Color: {item.color} | Talla: {item.size}
                </p>
              </div>
            ))}

            <div className="mt-4 border-t pt-3">
              <p className="font-bold text-lg">
                Total del pedido: ${selectedOrder.total}
              </p>
              <p className="text-sm text-gray-500">
                Envío: ${selectedOrder.shipping}
              </p>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-5 bg-gray-800 text-white px-4 py-2 rounded-lg w-full"
            >
              Cerrar
            </button>

          </div>
        </div>
      )}
    </div>
  );
}