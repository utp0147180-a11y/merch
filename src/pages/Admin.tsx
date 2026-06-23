export default function Admin() {
  return (
    <div className="min-h-screen bg-[#FDF8F4] p-8">
      <h1 className="text-3xl font-bold text-[#6B4423] mb-8">
        Panel Administrativo
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">
            Productos
          </h2>

          <p className="text-gray-600 mb-4">
            Administrar catálogo de productos.
          </p>

          <button className="bg-[#6B4423] text-white px-4 py-2 rounded-lg">
            Gestionar
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">
            Pedidos
          </h2>

          <p className="text-gray-600 mb-4">
            Revisar pedidos de clientes.
          </p>

          <button className="bg-[#6B4423] text-white px-4 py-2 rounded-lg">
            Ver pedidos
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">
            Dashboard
          </h2>

          <p className="text-gray-600 mb-4">
            Métricas y ventas.
          </p>

          <button className="bg-[#6B4423] text-white px-4 py-2 rounded-lg">
            Abrir
          </button>
        </div>

      </div>
    </div>
  );
}