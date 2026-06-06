import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import WhatsAppButton from './components/WhatsAppButton';
import Reviews from './components/Reviews';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import TeddyBearLogo from './components/TeddyBearLogo';
import { products, FREE_SHIPPING_THRESHOLD, ORDER_EMAIL } from './data';
import { CartItem, Product, User, Order } from './types';
import { saveOrder } from './lib/supabase';
import { TrendingUp, Zap, Truck, Gift, Sparkles, Instagram, ArrowRight, Star } from 'lucide-react';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  // Simulate loading animation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('merchRay_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('merchRay_user', JSON.stringify(user));
    else localStorage.removeItem('merchRay_user');
  }, [user]);

  // Filter products
  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'Todo') list = list.filter((p) => p.category === activeCategory || p.badge?.includes(activeCategory.split(' ')[0]));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [activeCategory, searchQuery, sortBy]);

  // Split for sections
  const newArrivals = products.filter((p) => p.isNew);
  const bestSellers = products.filter((p) => p.reviews >= 2000).slice(0, 4);
  const onSale = products.filter((p) => p.isSale);

  const addToCart = (product: Product, color: string, size?: string) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id && i.selectedColor === color);
      if (existing) return prev.map((i) => i.id === product.id && i.selectedColor === color ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1, selectedColor: color, selectedSize: size }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id: number, color: string, delta: number) => {
    setCartItems((prev) => prev.map((i) => i.id === id && i.selectedColor === color ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter((i) => i.quantity > 0));
  };

  const removeItem = (id: number, color: string) => setCartItems((prev) => prev.filter((i) => !(i.id === id && i.selectedColor === color)));

  const handleLogin = (userData: User) => setUser(userData);
  const handleLogout = () => setUser(null);

  const handleCheckout = () => {
    if (!user) { setCartOpen(false); setAuthOpen(true); }
    else { setCartOpen(false); setCheckoutOpen(true); }
  };

  const handleOrderComplete = async (order: Order) => {
    setLastOrder(order);
    setCartItems([]);
    setCheckoutOpen(false);

    // Send email notification (simulated - would need Edge Function for production)
    console.log('Order sent to:', ORDER_EMAIL);
    console.log('Order details:', order);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  // Loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#FDF8F4] via-[#F9F5F1] to-[#F5EDE5] flex flex-col items-center justify-center z-50">
        <div className="animate-bounce-slow mb-6">
          <TeddyBearLogo size={80} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#6B4423] tracking-wider">MERCH RAY</h1>
        <div className="flex items-center gap-1 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-[#D4A59A] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4]">
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAuthOpen={() => setAuthOpen(true)}
        user={user}
      />

      <main>
        <Hero />

        {/* Features bar */}
        <div className="bg-white border-y border-[#E8D4C4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={18} />, label: 'Envío Gratis', sub: `Desde $${FREE_SHIPPING_THRESHOLD}` },
              { icon: <Zap size={18} />, label: 'Pago Seguro', sub: 'Transferencia/Depósito' },
              { icon: <Gift size={18} />, label: 'Soporte WhatsApp', sub: 'Respuesta inmediata' },
              { icon: <Sparkles size={18} />, label: 'Calidad Premium', sub: 'Productos curados' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#FDF0ED] rounded-full flex items-center justify-center text-[#D4A59A] flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-xs font-semibold text-[#6B4423]">{label}</p>
                  <p className="text-[10px] text-[#B89B8A]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <section className="py-8 bg-[#FDF8F4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {['Todo', 'Ropa', 'Belleza', 'Ofertas', 'Nueva Colección'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-[#6B4423] text-white shadow-lg'
                      : 'bg-white text-[#8B7355] hover:bg-[#FDF0ED] border border-[#E8D4C4]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Nueva Colección */}
        {newArrivals.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[#D4A59A] text-xs font-semibold uppercase tracking-widest mb-1">Recién Llegado</p>
                  <h2 className="text-2xl font-serif font-bold text-[#6B4423]">Nueva Colección</h2>
                </div>
                <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#8B7355] hover:text-[#D4A59A] transition-colors">
                  Ver todo <ArrowRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {newArrivals.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Beauty Section */}
        <section className="py-12 bg-gradient-to-b from-[#FDF8F4] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFB6C1] to-[#D4A59A] rounded-full flex items-center justify-center text-white text-xl">💄</div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#6B4423]">Belleza</h2>
                <p className="text-xs text-[#B89B8A]">Skincare y maquillaje premium</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.filter((p) => p.category === 'Belleza').slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* Fashion Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4A59A] to-[#8B7355] rounded-full flex items-center justify-center text-white text-xl">👗</div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#6B4423]">Ropa</h2>
                <p className="text-xs text-[#B89B8A]">Estilo elegante y minimalista</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.filter((p) => p.category === 'Ropa').slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* Ofertas */}
        {onSale.length > 0 && (
          <section className="py-12 bg-gradient-to-r from-[#FFF5EE] to-[#FDF0ED]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#D4A59A] rounded-full flex items-center justify-center animate-pulse">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#6B4423]">Ofertas Especiales</h2>
                    <p className="text-xs text-[#B89B8A]">Hasta 30% de descuento</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {onSale.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#6B4423]">Todos los Productos</h2>
                <p className="text-xs text-[#B89B8A]">{filtered.length} productos encontrados</p>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-[#E8D4C4] rounded-full px-4 py-2 bg-white focus:outline-none focus:border-[#D4A59A] cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Calificados</option>
              </select>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[#B89B8A] text-lg">No se encontraron productos</p>
                <button onClick={() => { setSearchQuery(''); setActiveCategory('Todo'); }} className="mt-4 text-[#D4A59A] font-semibold hover:underline">Limpiar filtros</button>
              </div>
            )}
          </div>
        </section>

        {/* Reviews */}
        <Reviews />

        {/* CTA Banner */}
        <section className="py-12 bg-gradient-to-r from-[#D4A59A] to-[#CDA89C]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TeddyBearLogo size={40} className="opacity-90" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">¡Únete a nuestra comunidad!</h3>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">Síguenos en Instagram y TikTok para ver las últimas tendencias, tips de estilo y ofertas exclusivas.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="#" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all"><Instagram size={16} /> Instagram</a>
              <a href="#" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                TikTok
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#6B4423] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <TeddyBearLogo size={36} />
              <span className="text-lg font-serif font-semibold tracking-wider">MERCH RAY</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">Tu destino de moda y belleza premium. Estilo elegante para la mujer moderna.</p>
          </div>
          {[
            { title: 'Tienda', links: ['Ropa', 'Belleza', 'Nueva Colección', 'Ofertas'] },
            { title: 'Ayuda', links: ['Centro de Ayuda', 'Envíos', 'Devoluciones', 'Contacto'] },
            { title: 'Legal', links: ['Términos', 'Privacidad', 'Cookies'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-white/80">{title}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-xs text-white/60 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 text-center py-6 text-xs text-white/40">
          &copy; 2026 Merch Ray — Todos los derechos reservados
        </div>
      </footer>

      {/* Modals */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onUpdateQuantity={updateQuantity} onRemove={removeItem} onCheckout={handleCheckout} user={user} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} items={cartItems} user={user!} onOrderComplete={handleOrderComplete} />
      <WhatsAppButton />
    </div>
  );
}
