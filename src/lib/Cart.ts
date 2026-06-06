import { supabase } from './supabase';
import { CartItem } from '../types';

export const saveCart = async (userId: string, items: CartItem[]) => {
  const { error } = await supabase
    .from('carts')
    .upsert(
      {
        user_id: userId,
        items,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

  if (error) {
    console.error('Error guardando carrito:', error);
  }
};

export const getCart = async (userId: string) => {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error cargando carrito:', error);
    return [];
  }

  return data?.items || [];
};