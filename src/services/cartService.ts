import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type CartItem = Database['public']['Tables']['shopping_cart']['Row'];
type CartInsert = Database['public']['Tables']['shopping_cart']['Insert'];

export const cartService = {
  // Get user's cart items
  async getCartItems(userId: string) {
    const { data, error } = await supabase
      .from('shopping_cart')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          stock_quantity,
          is_active,
          business_profiles (
            business_name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Add item to cart
  async addToCart(userId: string, productId: string, quantity: number = 1) {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('shopping_cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      const { data, error } = await supabase
        .from('shopping_cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      return { data, error };
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('shopping_cart')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
        })
        .select()
        .single();

      return { data, error };
    }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }

    const { data, error } = await supabase
      .from('shopping_cart')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();

    return { data, error };
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string) {
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('id', cartItemId);

    return { error };
  },

  // Clear entire cart
  async clearCart(userId: string) {
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId);

    return { error };
  },

  // Get cart summary
  async getCartSummary(userId: string) {
    const { data, error } = await this.getCartItems(userId);

    if (error || !data) {
      return { data: null, error };
    }

    const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = data.reduce((sum, item) => {
      const product = item.products as any;
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    return {
      data: {
        items: data,
        totalItems,
        totalAmount,
      },
      error: null,
    };
  },
};