import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  avgOrderValue: number;
  ordersGrowth: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  users: {
    full_name: string;
  } | null;
}

interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    ordersGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<{ id: number; name: string; stock: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch orders stats
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total, status, created_at');

    const { data: products } = await supabase
      .from('products')
      .select('id, name, stock');

    const { data: users } = await supabase.from('users').select('id');

    const { data: recentOrdersData } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        total,
        status,
        created_at,
        users ( full_name )
      `
      )
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate stats
    const totalSales = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter((o) => o.status === 'pendiente').length || 0;
    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter((p) => (p.stock || 0) <= 5).length || 0;
    const totalUsers = users?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Fetch order items for top products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, product_name, quantity, price');

    const productSales: Record<number, TopProduct> = {};
    (orderItems || []).forEach((item) => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          id: item.product_id,
          name: item.product_name,
          total_sold: 0,
          revenue: 0,
        };
      }
      productSales[item.product_id].total_sold += item.quantity;
      productSales[item.product_id].revenue += item.price * item.quantity;
    });

    const topProductsList = Object.values(productSales)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5);

    // Low stock products
    const lowStockList = (products || [])
      .filter((p) => (p.stock || 0) <= 5)
      .slice(0, 5);

    setStats({
      totalSales,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalUsers,
      avgOrderValue,
      ordersGrowth: 12, // Placeholder
    });
    setRecentOrders((recentOrdersData as RecentOrder[]) || []);
    setTopProducts(topProductsList);
    setLowStock(lowStockList);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4A59A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#6B4423]">Dashboard</h1>
          <p className="text-sm text-[#B89B8A]">Resumen de tu tienda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#E8D4C4]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-[#FDF0ED] rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-[#D4A59A]" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <ArrowUp size={14} />
                <span>12%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#6B4423]">
              {formatCurrency(stats.totalSales)}
            </p>
            <p className="text-xs text-[#B89B8A]">Ventas totales</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8D4C4]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <ShoppingBag size={24} className="text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <ArrowUp size={14} />
                <span>8%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#6B4423]">
              {stats.totalOrders}
            </p>
            <p className="text-xs text-[#B89B8A]">Pedidos totales</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8D4C4]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#6B4423]">
              {stats.pendingOrders}
            </p>
            <p className="text-xs text-[#B89B8A]">Pedidos pendientes</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8D4C4]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#6B4423]">
              {stats.totalUsers}
            </p>
            <p className="text-xs text-[#B89B8A]">Clientes</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-[#E8D4C4] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8D4C4] flex items-center justify-between">
              <h2 className="font-semibold text-[#6B4423]">Pedidos recientes</h2>
              <a
                href="/admin/orders"
                className="text-sm text-[#D4A59A] hover:underline"
              >
                Ver todos
              </a>
            </div>
            <div className="divide-y divide-[#F5EDE5]">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#B89B8A]">
                  No hay pedidos aún
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="px-5 py-4 flex items-center justify-between hover:bg-[#FDF8F4]/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-[#6B4423]">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-[#B89B8A]">
                        {order.users?.full_name || 'Cliente'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#6B4423]">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-[#B89B8A]">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl border border-[#E8D4C4] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8D4C4] flex items-center justify-between">
              <h2 className="font-semibold text-[#6B4423] flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Stock bajo
              </h2>
              <a
                href="/admin/products"
                className="text-sm text-[#D4A59A] hover:underline"
              >
                Ver productos
              </a>
            </div>
            <div className="divide-y divide-[#F5EDE5]">
              {lowStock.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#B89B8A]">
                  No hay productos con stock bajo
                </div>
              ) : (
                lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="px-5 py-4 flex items-center justify-between"
                  >
                    <p className="font-medium text-[#6B4423]">{product.name}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {product.stock === 0 ? 'Agotado' : `${product.stock} uds`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-[#E8D4C4] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8D4C4]">
              <h2 className="font-semibold text-[#6B4423] flex items-center gap-2">
                <TrendingUp size={18} className="text-[#D4A59A]" />
                Productos más vendidos
              </h2>
            </div>
            <div className="divide-y divide-[#F5EDE5]">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="px-5 py-4 flex items-center gap-4"
                >
                  <span className="w-8 h-8 bg-[#FDF0ED] rounded-full flex items-center justify-center font-bold text-sm text-[#D4A59A]">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-[#6B4423]">{product.name}</p>
                    <p className="text-xs text-[#B89B8A]">
                      {product.total_sold} vendidos
                    </p>
                  </div>
                  <p className="font-medium text-[#6B4423]">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
