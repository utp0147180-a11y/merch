import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import WhatsAppButton from '../components/WhatsAppButton';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';

import { CartItem, Product, User } from '../types';


export default function Home() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [activeCategory, setActiveCategory] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');


  // ==========================
  // LOAD PRODUCTS + VARIANTS
  // ==========================

  const fetchProducts = async () => {

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });


    const { data: variantsData, error: variantsError } = await supabase
      .from('product_variants')
      .select('*');


    console.log("PRODUCTS:", productsData);
    console.log("VARIANTS:", variantsData);


    if (productsError || variantsError) {
      console.log(productsError || variantsError);
      setLoading(false);
      return;
    }


    const merged = (productsData || []).map((p:any) => {

      const variants = (variantsData || []).filter(
        (v:any) => Number(v.product_id) === Number(p.id)
      );


      return {
        ...p,

        // Para ProductCard
        colors: [...new Set(variants.map((v:any)=>v.color))],

        sizes: [...new Set(variants.map((v:any)=>v.size))],

        product_variants: variants
      };

    });


    console.log("MERGED PRODUCTS:", merged);

    setProducts(merged);
    setLoading(false);

  };


  useEffect(() => {
    fetchProducts();
  }, []);



  // USER

  useEffect(() => {

    const savedUser = localStorage.getItem('merchRay_user');

    if(savedUser){
      setUser(JSON.parse(savedUser));
    }

  }, []);


  useEffect(() => {

    if(user){
      localStorage.setItem(
        'merchRay_user',
        JSON.stringify(user)
      );
    }else{
      localStorage.removeItem('merchRay_user');
    }

  },[user]);




  // ==========================
  // FILTERS
  // ==========================

  const filtered = useMemo(()=>{

    let list = [...products];


    if(activeCategory !== 'Todo'){
      list = list.filter(
        p=>p.category === activeCategory
      );
    }


    if(searchQuery.trim()){

      const q = searchQuery.toLowerCase();

      list = list.filter(
        p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );

    }


    if(sortBy === 'price-asc'){
      list.sort(
        (a,b)=>a.price-b.price
      );
    }


    if(sortBy === 'price-desc'){
      list.sort(
        (a,b)=>b.price-a.price
      );
    }


    return list;


  },[
    products,
    activeCategory,
    searchQuery,
    sortBy
  ]);




  // ==========================
  // CART
  // ==========================


  const addToCart = (
    product: Product,
    color: string,
    size?: string
  )=>{


    const key =
    `${product.id}-${color}-${size || ''}`;



    setCartItems(prev=>{


      const exists = prev.find(
        item=>item.key === key
      );


      if(exists){

        return prev.map(item=>

          item.key === key
          ?
          {
            ...item,
            quantity:item.quantity+1
          }
          :
          item

        );

      }



      return [

        ...prev,

        {

          ...product,

          key,

          quantity:1,

          selectedColor:color,

          selectedSize:size || ''

        }

      ];


    });


    setCartOpen(true);


  };



  const cartCount =
  cartItems.reduce(
    (sum,item)=>sum+item.quantity,
    0
  );




  if(loading){

    return(

      <div className="fixed inset-0 flex items-center justify-center bg-[#FDF8F4]">

        <p className="text-[#6B4423]">
          Cargando...
        </p>

      </div>

    );

  }




  return (

    <div className="min-h-screen bg-[#FDF8F4]">


      <Header

        cartCount={cartCount}

        onCartOpen={()=>setCartOpen(true)}

        activeCategory={activeCategory}

        onCategoryChange={setActiveCategory}

        searchQuery={searchQuery}

        onSearchChange={setSearchQuery}

        onAuthOpen={()=>setAuthOpen(true)}

        user={user}

      />



      <Hero />



      <section className="py-10">

        <div className="
        max-w-7xl mx-auto px-4
        grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
        gap-5
        ">


          {filtered.map(product=>(

            <ProductCard

              key={product.id}

              product={product}

              onAddToCart={addToCart}

            />

          ))}


        </div>

      </section>





      <Cart

        isOpen={cartOpen}

        onClose={()=>setCartOpen(false)}

        items={cartItems}

        onUpdateQuantity={()=>{}}

        onRemove={()=>{}}

        onCheckout={()=>{}}

        user={user}

      />





      <AuthModal

        isOpen={authOpen}

        onClose={()=>setAuthOpen(false)}

        user={user}

        onLogin={setUser}

        onLogout={()=>setUser(null)}

      />





      <CheckoutModal

        isOpen={checkoutOpen}

        onClose={()=>setCheckoutOpen(false)}

        items={cartItems}

        user={user!}

        clearCart={()=>setCartItems([])}

      />



      <WhatsAppButton />


    </div>

  );

}