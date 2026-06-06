import { createClient } from '@supabase/supabase-js';
import { User, Order, CartItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('SUPABASE URL:', supabaseUrl);
console.log('SUPABASE URL:', supabaseUrl);
console.log('SUPABASE KEY EXISTS:', !!supabaseKey);

export async function saveUser(user: Omit<User, 'id' | 'createdAt'>) {
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  if (findError) {
    console.error('Error finding user:', findError);
    throw findError;
  }

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

  const { data, error } = await supabase
    .from('users')
    .insert({
      full_name: user.fullName,
      phone: user.phone,
      email: user.email,
      address: user.address,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
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

export async function getNextOrderNumber() {
  const { data: counter, error: readError } = await supabase
    .from('order_counters')
    .select('*')
    .eq('id', 'orders')
    .single();

  if (readError) {
    throw readError;
  }

  const nextValue = Number(counter.value) + 1;

  const { error: updateError } = await supabase
    .from('order_counters')
    .update({ value: nextValue })
    .eq('id', 'orders');

  if (updateError) {
    throw updateError;
  }

  return `#${String(nextValue).padStart(4, '0')}`;
}

export async function saveOrder(
  orderNumber: string,
  user: User,
  items: CartItem[],
  total: number,
  shipping: number
) {
  const savedUser = await saveUser({
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    address: user.address,
  });

  const generatedOrderNumber = await getNextOrderNumber();
  console.log('GENERATED ORDER NUMBER:', generatedOrderNumber);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: generatedOrderNumber,
      user_id: savedUser.id,
      total,
      shipping,
      status: 'pendiente',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    color: item.selectedColor,
    size: item.selectedSize || null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw itemsError;
  }

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