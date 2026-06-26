import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WishlistProvider, useWishlist } from '../contexts/WishlistContext';

import Header from '../components/Header';
import Hero from '../components/Hero';
import Cart from '../components/Cart';
import WhatsAppButton from '../components/WhatsAppButton';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import WishlistModal from '../components/WishlistModal';
import MyOrders from '../pages/MyOrders';

import { CartItem, Product, User } from '../types';
import { clothingSubcategories } from '../data';

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [activeCategory, setActiveCategory] = useState('Todo');
  const [activeSubcategory, setActiveSubcategory] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const {
    wishlist,
    wishlistProducts,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  // Fetch products with variants
  const fetchProducts = async () => {
    setLoading(true);
    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*');

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const merged = (productsData || []).map((p: any) => ({
      ...p,
      colors: p.colors || [],
      sizes: p.sizes || [],
      product_variants: (variantsData || []).filter(
        (v: any) => Number(v.product_id) === Number(p.id)
      ),
    }));

    setProducts(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('merchRay_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('merchRay_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('merchRay_user');
    }
  }, [user]);

  // Filter products
  const filtered = useMemo(() => {
    let list = [...products];

    // Category filter (including Offers)
    if (activeCategory !== 'Todo') {
      if (activeCategory === 'Ofertas') {
        // Show products on sale (original_price > price)
        list = list.filter((p) => p.original_price && p.original_price > p.price);
      } else {
        list = list.filter((p) => p.category === activeCategory);
      }
    }

    // Subcategory filter (for Clothing)
    if (activeCategory === 'Ropa' && activeSubcategory !== 'Todo') {
      list = list.filter((p) => p.subcategory === activeSubcategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
    }

    return list;
  }, [products, activeCategory, activeSubcategory, searchQuery, sortBy]);

  // Get variant stock
  const getVariantStock = (productId: number, color: string, size?: string): number => {
    const product = products.find((p) => p.id === productId);
    if (!product?.product_variants) return 10;

    const variant = product.product_variants.find((v) => {
      const colorMatch = v.color === color;
      const sizeMatch = size ? v.size === size : !v.size;
      return colorMatch && sizeMatch;
    });

    return variant?.stock ?? 0;
  };

  // Add to cart with variant support
  const addToCart = (
    product: Product,
    color: string,
    size?: string,
    variantId?: number
  ) => {
    const key = `${product.id}-${color}-${size || ''}`;
    const stock = getVariantStock(product.id, color, size);

    setCartItems((prev) => {
      const exists = prev.find((item) => item.key === key);

      if (exists) {
        if (exists.quantity >= stock) {
          return prev;
        }
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: Math.min(item.quantity + 1, stock) }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          key,
          quantity: 1,
          selectedColor: color,
          selectedSize: size || '',
          selectedVariantId: variantId,
        },
      ];
    });

    setCartOpen(true);
  };

  // Update quantity with stock check
  const updateQuantity = (
    id: number,
    color: string,
    size: string | undefined,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (
            item.id === id &&
            item.selectedColor === color &&
            item.selectedSize === size
          ) {
            const stock = getVariantStock(id, color, size);
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: Math.max(0, Math.min(newQty, stock)),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeItem = (id: number, color: string, size?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedColor === color &&
            item.selectedSize === size
          )
      )
    );
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic page title
  useEffect(() => {
    const titles: Record<string, string> = {
      Todo: 'MerchRay - Moda y Belleza Online',
      Ropa: 'Ropa | MerchRay',
      Belleza: 'Belleza | MerchRay',
      Accesorios: 'Accesorios | MerchRay',
      Ofertas: 'Ofertas | MerchRay',
    };
    document.title = titles[activeCategory] || 'MerchRay - Moda y Belleza Online';
  }, [activeCategory]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FDF8F4]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#D4A59A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#8B7355]">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4]">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onCartOpen={() => setCartOpen(true)}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          if (cat !== 'Ropa') setActiveSubcategory('Todo');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAuthOpen={() => setAuthOpen(true)}
        user={user}
        onOrdersOpen={() => setOrdersOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />

      {/* Only show Hero on main page */}
      {activeCategory === 'Todo' && <Hero />}

      {/* Category Header */}
      {activeCategory !== 'Todo' && (
        <div className="bg-[#F9F5F1] py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-serif font-bold text-[#6B4423] mb-2">
              {activeCategory === 'Ofertas' ? 'Ofertas Especiales' : activeCategory}
            </h1>
            <p className="text-sm text-[#8B7355]">
              {filtered.length} productos encontrados
            </p>
          </div>
        </div>
      )}

      {/* Subcategory filters for Clothing */}
      {activeCategory === 'Ropa' && (
        <div className="bg-white border-b border-[#E8D4C4] py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2">
              {clothingSubcategories.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => setActiveSubcategory(sub.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeSubcategory === sub.name
                      ? 'bg-[#D4A59A] text-white'
                      : 'bg-[#F9F5F1] text-[#8B7355] hover:bg-[#E8D4C4]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Bar */}
      {filtered.length > 0 && (
        <div className="bg-white border-b border-[#E8D4C4] py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <p className="text-sm text-[#8B7355]">
              Mostrando {filtered.length} productos
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-[#E8D4C4] rounded-lg px-3 py-2 bg-[#FDF8F4] text-[#6B4423] focus:outline-none focus:border-[#D4A59A]"
            >
              <option value="featured">Destacados</option>
              <option value="newest">Más nuevos</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="rating">Mejor valorados</option>
            </select>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg text-[#6B4423] mb-2">No se encontraron productos</p>
              <p className="text-sm text-[#B89B8A]">
                Intenta con otros filtros o términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  isWishlisted={isInWishlist(product.id)}
                  onWishlist={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product.id);
                    }
                  }}
                  onQuickView={() => handleQuickView(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        products={products}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={() => setCheckoutOpen(true)}
        user={user}
        onAuthOpen={() => setAuthOpen(true)}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        user={user}
        onLogin={setUser}
        onLogout={() => setUser(null)}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        user={user!}
        clearCart={() => setCartItems([])}
      />

      <QuickViewModal
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={selectedProduct}
        onAddToCart={addToCart}
      />

      <WishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        products={wishlistProducts}
        onRemove={removeFromWishlist}
        onAddToCart={addToCart}
      />

      {ordersOpen && user && (
        <div className="fixed inset-0 z-[60] bg-white">
          <MyOrders user={user} onClose={() => setOrdersOpen(false)} />
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('merchRay_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  return (
    <WishlistProvider user={user}>
      <HomeContent />
    </WishlistProvider>
  );
}
