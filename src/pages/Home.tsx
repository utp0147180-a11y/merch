import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';

import Header from '../components/Header';
import Hero from '../components/Hero';
import Cart from '../components/Cart';
import WhatsAppButton from '../components/WhatsAppButton';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import ProductCard from '../components/ProductCard';

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


  const fetchProducts = async () => {

    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending:false });


    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*');


    if(error){
      console.log(error);
      setLoading(false);
      return;
    }


    const merged = (productsData || []).map((p:any)=>({

      ...p,

      colors: p.colors || [],
      sizes: p.sizes || [],

      product_variants:
        (variantsData || []).filter(
          (v:any)=>
          Number(v.product_id) === Number(p.id)
        )

    }));


    setProducts(merged);
    setLoading(false);
  };


  useEffect(()=>{
    fetchProducts();
  },[]);


  useEffect(()=>{

    const saved =
      localStorage.getItem('merchRay_user');

    if(saved){
      setUser(JSON.parse(saved));
    }

  },[]);


  useEffect(()=>{

    if(user){
      localStorage.setItem(
        'merchRay_user',
        JSON.stringify(user)
      );
    }else{
      localStorage.removeItem('merchRay_user');
    }

  },[user]);

    const filtered = useMemo(()=>{

    let list = [...products];


    if(activeCategory !== 'Todo'){
      list = list.filter(
        p => p.category === activeCategory
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




  const addToCart = (
    product: Product,
    color: string,
    size?: string
  ) => {


    setCartItems(prev=>{


      const key =
      `${product.id}-${color}-${size || ''}`;


      const exists =
      prev.find(
        item => item.key === key
      );


      if(exists){

        return prev.map(item=>

          item.key === key

          ?

          {
            ...item,
            quantity:item.quantity + 1
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





  const updateQuantity = (
    id:number,
    color:string,
    delta:number
  )=>{


    setCartItems(prev=>

      prev
      .map(item=>{


        if(
          item.id === id &&
          item.selectedColor === color
        ){

          return {

            ...item,

            quantity:
            item.quantity + delta

          };

        }


        return item;


      })

      .filter(
        item=>item.quantity > 0
      )

    );


  };





  const removeItem = (
    id:number,
    color:string
  )=>{


    setCartItems(prev=>

      prev.filter(

        item =>

        !(
          item.id === id &&
          item.selectedColor === color
        )

      )

    );


  };




  const cartCount =
  cartItems.reduce(
    (sum,item)=>sum + item.quantity,
    0
  );



  if(loading){

    return (

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

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">


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

        onUpdateQuantity={updateQuantity}

        onRemove={removeItem}

        onCheckout={()=>setCheckoutOpen(true)}

        user={user}

        onAuthOpen={()=>setAuthOpen(true)}

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