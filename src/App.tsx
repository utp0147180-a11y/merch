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
import { TrendingUp, Zap, Truck, Gift, Sparkles, Instagram, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('merchRay_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('merchRay_user', JSON.stringify(user));
    else localStorage.removeItem('merchRay_user');
  }, [user]);

  const filtered = useMemo(() => {
    let list = products;

    if (activeCategory !== 'Todo') {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [activeCategory, searchQuery, sortBy]);

  const addToCart = (product: Product, color: string, size?: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && i.selectedColor === color
      );

      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.selectedColor === color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        { ...product, quantity: 1, selectedColor: color, selectedSize: size }
      ];
    });

    setCartOpen(true);
  };

  const updateQuantity = (id: number, color: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.id === id && i.selectedColor === color
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id: number, color: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === id && i.selectedColor === color))
    );
  };

  const handleLogin = (userData: User) => setUser(userData);
  const handleLogout = () => setUser(null);

  const handleCheckout = () => {
    if (!user) {
      setCartOpen(false);
      setAuthOpen(true);
    } else {
      setCartOpen(false);
      setCheckoutOpen(true);
    }
  };

  // ✅ AQUÍ ESTABA TU ERROR
  const handleOrderComplete = (order: Order) => {
    console.log('Pedido creado:', order);

    setLastOrder(order);

    // ❌ NO cierres checkout aquí
    // setCheckoutOpen(false);

    console.log('Order sent to:', ORDER_EMAIL);
    console.log('Order details:', order);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <TeddyBearLogo size={80} />
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

      <Hero />

      {/* MODALS */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={handleCheckout}
        user={user}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        user={user!}
        clearCart={() => setCartItems([])}
        onOrderComplete={handleOrderComplete}
      />

      <WhatsAppButton />
    </div>
  );
}