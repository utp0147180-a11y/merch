import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Product, User } from '../types';

interface WishlistContextType {
  wishlist: number[];
  isLoading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  wishlistProducts: Product[];
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist from localStorage for guests, from DB for users
  useEffect(() => {
    if (user) {
      fetchWishlistFromDB();
    } else {
      const saved = localStorage.getItem('merchRay_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    }
  }, [user]);

  // Save wishlist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('merchRay_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  // Fetch wishlist products when wishlist changes
  useEffect(() => {
    if (wishlist.length > 0) {
      fetchWishlistProducts();
    } else {
      setWishlistProducts([]);
    }
  }, [wishlist]);

  const fetchWishlistFromDB = async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setWishlist(data.map((item) => item.product_id));
    }
    setIsLoading(false);
  };

  const fetchWishlistProducts = async () => {
    if (wishlist.length === 0) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', wishlist);

    if (!error && data) {
      setWishlistProducts(data as Product[]);
    }
  };

  const addToWishlist = async (productId: number) => {
    if (user) {
      const { error } = await supabase.from('wishlist').insert({
        user_id: user.id,
        product_id: productId,
      });

      if (!error) {
        setWishlist((prev) => [...prev, productId]);
      }
    } else {
      setWishlist((prev) => {
        if (prev.includes(productId)) return prev;
        return [...prev, productId];
      });
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (user) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistProducts,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
