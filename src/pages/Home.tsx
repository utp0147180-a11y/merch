import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import WhatsAppButton from '../components/WhatsAppButton';
import Reviews from '../components/Reviews';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import TeddyBearLogo from '../components/TeddyBearLogo';
import { FREE_SHIPPING_THRESHOLD } from '../data';
import { supabase } from '../lib/supabase';
import { CartItem, Product, User } from '../types';
import { TrendingUp, Zap, Truck, Gift, Sparkles, Instagram, ArrowRight } from 'lucide-react';

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Simulate loading animation
 useEffect(() => {

  const fetchProducts = async () => {

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)