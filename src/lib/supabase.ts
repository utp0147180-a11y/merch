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
// Uses atomic update to ensure stock is only restored once
export async function cancelOrderWithStockRestoration(orderId: string): Promise<{ success: boolean; error?: string }> {
  // ATOMIC UPDATE: Only succeed if status is currently 'pendiente'
  // This prevents race conditions where both admin and customer try to cancel simultaneously
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({ status: 'cancelado' })
    .eq('id', orderId)
    .eq('status', 'pendiente')  // This is the key - only matches if still pending
    .select('id, status, order_items(id, product_id, quantity, color, size, variant_id)')
    .single();

  if (updateError || !updatedOrder) {
    // Order was not updated - either doesn't exist or was already cancelled/not pending
    // Check current status to provide appropriate message
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // If already cancelled, return success (idempotent)
    if (order.status === 'cancelado') {
      return { success: true };
    }

    // Order exists but not in a cancellable state
    return { success: false, error: `Order status is '${order.status}', cannot cancel` };
  }

  // We successfully updated the status from pendiente to cancelado
  // Now restore stock for each item (this only happens once due to atomic update above)
  for (const item of updatedOrder.order_items) {
    if (item.variant_id) {
      await restoreVariantStock(item.variant_id, item.quantity);
    } else if (item.product_id) {
      // Fallback to product stock if no variant
      await restoreProductStock(item.product_id, item.quantity);
    }
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

  const { data: images, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .order('sort_order', { ascending: true });

  if (imagesError) throw imagesError;

  const { data: variantImages, error: variantImagesError } = await supabase
    .from('product_variant_images')
    .select('*')
    .order('sort_order', { ascending: true });

  if (variantImagesError) throw variantImagesError;

  return (products || []).map((p) => ({
    ...p,
    product_variants: (variants || []).filter(
      (v) => v.product_id === p.id
    ),
    product_images: (images || []).filter(
      (i) => i.product_id === p.id
    ),
    variant_images: (variantImages || []).filter(
      (vi) => vi.product_id === p.id
    ),
  }));
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

// ============================================
// Product Images Management
// ============================================

export async function fetchProductImages(productId: number) {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data;
}

export async function createProductImage(
  productId: number,
  image: { image_url: string; alt_text?: string; sort_order?: number; is_primary?: boolean; variant_color?: string }
) {
  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      image_url: image.image_url,
      alt_text: image.alt_text || null,
      sort_order: image.sort_order || 0,
      is_primary: image.is_primary || false,
      variant_color: image.variant_color || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateProductImage(
  imageId: number,
  updates: Partial<{ image_url: string; alt_text: string; sort_order: number; is_primary: boolean; variant_color: string }>
) {
  const { data, error } = await supabase
    .from('product_images')
    .update(updates)
    .eq('id', imageId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProductImage(imageId: number) {
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
}

export async function setPrimaryImage(productId: number, imageId: number) {
  // First, unset all primary flags for this product
  await supabase
    .from('product_images')
    .update({ is_primary: false })
    .eq('product_id', productId);

  // Then set the selected image as primary
  const { data, error } = await supabase
    .from('product_images')
    .update({ is_primary: true })
    .eq('id', imageId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function reorderProductImages(productId: number, imageIds: number[]) {
  // Update sort_order for each image
  const updates = imageIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  for (const update of updates) {
    await supabase
      .from('product_images')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id);
  }
}

// ============================================
// Variant Images Management (Color-specific images)
// ============================================

export async function fetchVariantImages(productId: number) {
  const { data, error } = await supabase
    .from('product_variant_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data;
}

export async function fetchVariantImagesByColor(productId: number, color: string) {
  const { data, error } = await supabase
    .from('product_variant_images')
    .select('*')
    .eq('product_id', productId)
    .eq('variant_color', color)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data;
}

export async function createVariantImage(
  productId: number,
  image: { variant_color: string; image_url: string; alt_text?: string; sort_order?: number }
) {
  const { data, error } = await supabase
    .from('product_variant_images')
    .insert({
      product_id: productId,
      variant_color: image.variant_color,
      image_url: image.image_url,
      alt_text: image.alt_text || null,
      sort_order: image.sort_order || 0,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateVariantImage(
  imageId: number,
  updates: Partial<{ variant_color: string; image_url: string; alt_text: string; sort_order: number }>
) {
  const { data, error } = await supabase
    .from('product_variant_images')
    .update(updates)
    .eq('id', imageId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteVariantImage(imageId: number) {
  const { error } = await supabase
    .from('product_variant_images')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
}

export async function deleteVariantImagesByColor(productId: number, color: string) {
  const { error } = await supabase
    .from('product_variant_images')
    .delete()
    .eq('product_id', productId)
    .eq('variant_color', color);

  if (error) throw error;
}

export async function reorderVariantImages(productId: number, color: string, imageIds: number[]) {
  const updates = imageIds.map((id, index) => ({
    id,
    sort_order: index,
  }));

  for (const update of updates) {
    await supabase
      .from('product_variant_images')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id)
      .eq('product_id', productId)
      .eq('variant_color', color);
  }
}
