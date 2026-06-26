import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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

import { CartItem, Product, User, ProductWithVariants } from '../types';
import { clothingSubcategories } from '../data';

// Global product state for real-time updates
let globalProducts: Product[] = [];
const productSubscribers: Set<() => void> = new Set();

export function notifyProductUpdate() {
  productSubscribers.forEach((fn) => fn());
}

function useProducts() {
  const [products, setProducts] = useState<Product[]>(globalProducts);
  const [loading, setLoading] = useState(globalProducts.length === 0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*');

    const { data: imagesData } = await supabase
      .from('product_images')
      .select('*')
      .order('sort_order', { ascending: true });

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
      product_images: (imagesData || []).filter(
        (img: any) => Number(img.product_id) === Number(p.id)
      ),
    }));

    globalProducts = merged;
    setProducts(merged);
    setLoading(false);
  }, []);

  // Subscribe to product updates
  useEffect(() => {
    const refresh = () => {
      fetchProducts();
    };
    productSubscribers.add(refresh);
    return () => {
      productSubscribers.delete(refresh);
    };
  }, [fetchProducts]);

  // Initial fetch
  useEffect(() => {
    if (globalProducts.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants' },
        () => fetchProducts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_images' },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}

function HomeContent() {
  const { products, loading, refetch } = useProducts();

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

  // Recently viewed products
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);

  const {
    wishlist,
    wishlistProducts,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  // Load recently viewed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('merchRay_recently_viewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  // Save recently viewed
  const addToRecentlyViewed = useCallback((productId: number) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10);
      localStorage.setItem('merchRay_recently_viewed', JSON.stringify(updated));
      return updated;
    });
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

  // Get recently viewed products
  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewed
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [recentlyViewed, products]);

  // Get variant stock - always from current products state
  const getVariantStock = useCallback(
    (productId: number, color: string, size?: string): number => {
      const product = products.find((p) => p.id === productId);
      if (!product?.product_variants) return 0;

      const variant = product.product_variants.find((v) => {
        const colorMatch = v.color === color;
        const sizeMatch = size ? v.size === size : !v.size;
        return colorMatch && sizeMatch;
      });

      return variant?.stock ?? 0;
    },
    [products]
  );

  // Check if product/variant is in stock
  const isInStock = useCallback(
    (productId: number, color?: string, size?: string): boolean => {
      const product = products.find((p) => p.id === productId);
      if (!product) return false;

      if (color) {
        return getVariantStock(productId, color, size) > 0;
      }

      // Check total stock across all variants or product stock
      if (product.product_variants && product.product_variants.length > 0) {
        return product.product_variants.some((v) => v.stock > 0);
      }

      return (product.stock || 0) > 0;
    },
    [products, getVariantStock]
  );

  // Add to cart with variant support
  const addToCart = useCallback(
    (product: Product, color: string, size?: string, variantId?: number) => {
      const key = `${product.id}-${color}-${size || ''}`;
      const currentStock = getVariantStock(product.id, color, size);

      if (currentStock <= 0) {
        alert('Este producto está agotado');
        return;
      }

      setCartItems((prev) => {
        const exists = prev.find((item) => item.key === key);

        if (exists) {
          if (exists.quantity >= currentStock) {
            alert(`Solo hay ${currentStock} unidades disponibles`);
            return prev;
          }
          return prev.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(item.quantity + 1, currentStock) }
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
    },
    [getVariantStock]
  );

  // Update quantity with stock check
  const updateQuantity = useCallback(
    (id: number, color: string, size: string | undefined, delta: number) => {
      setCartItems((prev) =>
        prev
          .map((item) => {
            if (
              item.id === id &&
              item.selectedColor === color &&
              item.selectedSize === size
            ) {
              const currentStock = getVariantStock(id, color, size);
              const newQty = item.quantity + delta;
              return {
                ...item,
                quantity: Math.max(0, Math.min(newQty, currentStock)),
              };
            }
            return item;
          })
          .filter((item) => item.quantity > 0)
      );
    },
    [getVariantStock]
  );

  // Remove item
  const removeItem = useCallback((id: number, color: string, size?: string) => {
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
  }, []);

  // Handle successful checkout - refresh all product data
  const handleCheckoutSuccess = useCallback(() => {
    setCartItems([]);
    setCartOpen(false);
    refetch();
    notifyProductUpdate();
  }, [refetch]);

  const handleQuickView = useCallback(
    (product: Product) => {
      // Get the latest product data from state
      const latestProduct = products.find((p) => p.id === product.id) || product;
      setSelectedProduct(latestProduct);
      addToRecentlyViewed(product.id);
      setQuickViewOpen(true);
    },
    [products, addToRecentlyViewed]
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Validate cart items against current stock
  useEffect(() => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          const currentStock = getVariantStock(
            item.id,
            item.selectedColor,
            item.selectedSize
          );
          const maxQty = Math.max(0, Math.min(item.quantity, currentStock));
          return { ...item, quantity: maxQty, stock: currentStock };
        })
        .filter((item) => item.quantity > 0)
    );
  }, [products, getVariantStock]);

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
              {filtered.map((product) => {
                // Get latest stock for this product
                const latestProduct = products.find((p) => p.id === product.id) || product;
                return (
                  <ProductCard
                    key={product.id}
                    product={latestProduct}
                    onAddToCart={addToCart}
                    isWishlisted={isInWishlist(product.id)}
                    onWishlist={() => {
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlist(product.id);
                      }
                    }}
                    onQuickView={() => handleQuickView(latestProduct)}
                    getStock={getVariantStock}
                    isInStock={isInStock}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewedProducts.length > 0 && activeCategory === 'Todo' && (
        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-semibold text-[#6B4423] mb-4">
              Vistos recientemente
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {recentlyViewedProducts.slice(0, 8).map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleQuickView(product)}
                  className="group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FDF8F4]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-xs text-[#6B4423] mt-2 line-clamp-1 group-hover:text-[#D4A59A]">
                    {product.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

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
        getStock={getVariantStock}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        user={user}
        onLogin={setUser}
        onLogout={() => setUser(null)}
      />

      {user && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          items={cartItems}
          user={user}
          clearCart={handleCheckoutSuccess}
          onOrderComplete={handleCheckoutSuccess}
        />
      )}

      <QuickViewModal
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={selectedProduct}
        onAddToCart={addToCart}
        getStock={getVariantStock}
        isInStock={isInStock}
        products={products}
      />

      <WishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        products={wishlistProducts}
        onRemove={removeFromWishlist}
        onAddToCart={addToCart}
        getStock={getVariantStock}
        isInStock={isInStock}
      />

      {ordersOpen && user && (
        <div className="fixed inset-0 z-[60] bg-white">
          <MyOrders
            user={user}
            onClose={() => setOrdersOpen(false)}
            products={products}
            getStock={getVariantStock}
          />
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
