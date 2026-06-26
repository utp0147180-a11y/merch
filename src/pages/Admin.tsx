import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface AdminProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Admin({ currentPage = 'dashboard', onNavigate }: AdminProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    lowStock: 0,
  });

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'pendiente');

    const { data: products } = await supabase
      .from('product_variants')
      .select('id')
      .lte('stock', 5)
      .gt('stock', 0);

    setStats({
      pendingOrders: orders?.length || 0,
      lowStock: products?.length || 0,
    });
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: ShoppingBag,
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : null,
    },
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      badge: null,
    },
    {
      id: 'coupons',
      label: 'Cupones',
      icon: Tag,
      badge: null,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('merchRay_admin');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#FDF8F4]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8D4C4]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#F5EDE5]"
          >
            <Menu size={24} className="text-[#6B4423]" />
          </button>
          <h1 className="text-lg font-bold text-[#6B4423]">MerchRay Admin</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#6B4423] text-white z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold">MerchRay</h2>
            <p className="text-xs text-white/60">Panel Admin</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate?.(item.id);
                  setSidebarOpen(false);
                  // Navigate using hash for SPA
                  window.location.hash = item.id;
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white text-[#6B4423]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#D4A59A] text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Render content based on hash */}
          <AdminContent currentPage={currentPage} />
        </div>
      </main>
    </div>
  );
}

import Dashboard from './Admin/Dashboard';
import Orders from './Admin/Orders';
import Products from './Admin/Products';
import Coupons from './Admin/Coupons';

function AdminContent({ currentPage }: { currentPage: string }) {
  switch (currentPage) {
    case 'orders':
      return <Orders />;
    case 'products':
      return <Products />;
    case 'coupons':
      return <Coupons />;
    default:
      return <Dashboard />;
  }
}
