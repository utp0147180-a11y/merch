import { createClient } from '@supabase/supabase-js';
import { User, Order, CartItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveUser(user: Omit<User, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      full_name: user.fullName,
      phone: user.phone,
      email: user.email,
      address: user.address,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving user:', error);
    // If user already exists, fetch them
    if (error.code === '23505') {
      const { data: existingUser } = await supabase
        .from('users')
        .select()
        .eq('email', user.email)
        .maybeSingle();

      if (existingUser) {
        return {
          id: existingUser.id,
          fullName: existingUser.full_name,
          phone: existingUser.phone,
          email: existingUser.email,
          address: existingUser.address,
          createdAt: existingUser.created_at,
        } as User;
      }
    }
    throw error;
  }

  return {
    id: data.id,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    createdAt: data.created_at,
  } as User;
}

export async function saveOrder(
  orderNumber: string,
  user: User,
  items: CartItem[],
  total: number,
  shipping: number
) {
  // First save the user
  const savedUser = await saveUser({
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    address: user.address,
  });

  // Then save the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: savedUser.id,
      total,
      shipping,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Then save the order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    color: item.selectedColor,
    size: item.selectedSize || null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) throw itemsError;

  return {
    id: order.id,
    orderNumber: order.order_number,
    userId: order.user_id,
    items: items.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      color: item.selectedColor,
      size: item.selectedSize,
    })),
    total: order.total,
    shipping: order.shipping,
    status: order.status,
    createdAt: order.created_at,
  } as Order;
}

export async function getOrdersByUser(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
