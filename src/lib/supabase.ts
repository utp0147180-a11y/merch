import { createClient } from '@supabase/supabase-js';
import { User, Order, CartItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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

// Find variant by product, color, and size
async function findVariant(
  productId: number,
  color: string,
  size?: string
): Promise<number | null> {
  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', productId)
    .eq('color', color)
    .eq('size', size || null)
    .eq('active', true)
    .limit(1);

  if (error || !variants || variants.length === 0) {
    return null;
  }

  return variants[0].id;
}

// Deduct stock from variant
async function deductVariantStock(
  variantId: number,
  quantity: number
): Promise<boolean> {
  // Get current stock
  const { data: variant, error: fetchError } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', variantId)
    .single();

  if (fetchError || !variant) {
    console.error('Error fetching variant stock:', fetchError);
    return false;
  }

  const newStock = Math.max(0, variant.stock - quantity);

  const { error: updateError } = await supabase
    .from('product_variants')
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq('id', variantId);

  if (updateError) {
    console.error('Error updating variant stock:', updateError);
    return false;
  }

  return true;
}

// Deduct stock from product (legacy, for products without variants)
async function deductProductStock(
  productId: number,
  quantity: number
): Promise<void> {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single();

  if (fetchError || !product) return;

  const newStock = Math.max(0, (product.stock || 0) - quantity);

  await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId);
}

// Restore stock to variant
async function restoreVariantStock(
  variantId: number,
  quantity: number
): Promise<boolean> {
  const { data: variant, error: fetchError } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', variantId)
    .single();

  if (fetchError || !variant) {
    console.error('Error fetching variant for stock restore:', fetchError);
    return false;
  }

  const newStock = variant.stock + quantity;

  const { error: updateError } = await supabase
    .from('product_variants')
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq('id', variantId);

  if (updateError) {
    console.error('Error restoring variant stock:', updateError);
    return false;
  }

  return true;
}

// Restore stock to product (legacy)
async function restoreProductStock(
  productId: number,
  quantity: number
): Promise<void> {
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single();

  if (fetchError || !product) return;

  const newStock = (product.stock || 0) + quantity;

  await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId);
}

// Cancel order with stock restoration - IDEMPOTENT
// Only restores stock if order is currently 'pendiente'
export async function cancelOrderWithStockRestoration(orderId: string): Promise<{ success: boolean; error?: string }> {
  // First, get the order and verify its current status
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, order_items(id, product_id, quantity, color, size, variant_id)')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    console.error('Error fetching order for cancellation:', fetchError);
    return { success: false, error: 'Order not found' };
  }

  // IDEMPOTENCY CHECK: Only restore stock if currently pending
  if (order.status !== 'pendiente') {
    // Just update the status if needed, don't restore stock
    if (order.status !== 'cancelado') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelado' })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: 'Failed to update status' };
      }
    }
    return { success: true };
  }

  // Restore stock for each item
  for (const item of order.order_items) {
    if (item.variant_id) {
      await restoreVariantStock(item.variant_id, item.quantity);
    } else if (item.product_id) {
      // Fallback to product stock if no variant
      await restoreProductStock(item.product_id, item.quantity);
    }
  }

  // Update order status to cancelled
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'cancelado' })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order status:', updateError);
    return { success: false, error: 'Failed to cancel order' };
  }

  return { success: true };
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

  // Find variants for each cart item
  const orderItemsWithVariants = await Promise.all(
    items.map(async (item) => {
      const variantId = item.selectedVariantId || (await findVariant(item.id, item.selectedColor, item.selectedSize));
      return {
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize || null,
        variant_id: variantId,
      };
    })
  );

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsWithVariants);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw itemsError;
  }

  // Deduct stock from variants
  for (const item of items) {
    const variantId = item.selectedVariantId || (await findVariant(item.id, item.selectedColor, item.selectedSize));

    if (variantId) {
      await deductVariantStock(variantId, item.quantity);
    } else {
      // Fallback to product stock if no variant
      await deductProductStock(item.id, item.quantity);
    }
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
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

// Product management functions
export async function fetchProductsWithVariants() {
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (productsError) throw productsError;

  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*');

  if (variantsError) throw variantsError;

  return (products || []).map((p) => ({
    ...p,
    product_variants: (variants || []).filter(
      (v) => v.product_id === p.id
    ),
  }));
}

export async function fetchProductImages(productId: number) {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data;
}

export async function createProductVariant(
  productId: number,
  variant: { color: string; size?: string; stock: number; sku?: string; price?: number }
) {
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: productId,
      color: variant.color,
      size: variant.size || null,
      stock: variant.stock,
      sku: variant.sku || null,
      price: variant.price || null,
      active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateProductVariant(
  variantId: number,
  updates: Partial<{ color: string; size: string; stock: number; sku: string; price: number; active: boolean }>
) {
  const { data, error } = await supabase
    .from('product_variants')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', variantId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProductVariant(variantId: number) {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId);

  if (error) throw error;
}

export async function deleteAllProductVariants(productId: number) {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId);

  if (error) throw error;
}
