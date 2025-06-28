import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export const productService = {
  // Get all products with category and business info
  async getProducts(filters?: {
    category?: string;
    search?: string;
    businessId?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          description
        ),
        business_profiles (
          id,
          business_name,
          is_verified
        )
      `)
      .eq('is_active', true)
      .gt('stock_quantity', 0);

    if (filters?.category) {
      query = query.eq('categories.name', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.businessId) {
      query = query.eq('business_id', filters.businessId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  },

  // Get single product with reviews
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          description
        ),
        business_profiles (
          id,
          business_name,
          is_verified
        ),
        product_reviews (
          id,
          rating,
          title,
          comment,
          helpful_count,
          created_at,
          user_profiles (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Create product (business owners only)
  async createProduct(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    return { data, error };
  },

  // Update product (business owners only)
  async updateProduct(id: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Delete product (business owners only)
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    return { error };
  },

  // Get categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    return { data, error };
  },
};