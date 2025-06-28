import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];
type BusinessInsert = Database['public']['Tables']['business_profiles']['Insert'];
type BusinessUpdate = Database['public']['Tables']['business_profiles']['Update'];

export const businessService = {
  // Get business profile for current user
  async getBusinessProfile(userId: string) {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Create business profile
  async createBusinessProfile(profile: BusinessInsert) {
    const { data, error } = await supabase
      .from('business_profiles')
      .insert(profile)
      .select()
      .single();

    return { data, error };
  },

  // Update business profile
  async updateBusinessProfile(userId: string, updates: BusinessUpdate) {
    const { data, error } = await supabase
      .from('business_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Get business products
  async getBusinessProducts(businessId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get business orders
  async getBusinessOrders(businessId: string) {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        orders (
          id,
          order_number,
          status,
          created_at,
          user_profiles (
            full_name
          )
        ),
        products (
          name,
          image_url
        )
      `)
      .eq('products.business_id', businessId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get business analytics
  async getBusinessAnalytics(businessId: string) {
    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_active', true);

    // Get total orders (simplified - would need more complex query for actual orders)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        quantity,
        total_price,
        products!inner (
          business_id
        )
      `)
      .eq('products.business_id', businessId);

    const totalOrders = orderItems?.length || 0;
    const totalRevenue = orderItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;

    // Get average rating
    const { data: reviews } = await supabase
      .from('product_reviews')
      .select(`
        rating,
        products!inner (
          business_id
        )
      `)
      .eq('products.business_id', businessId);

    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      data: {
        totalProducts: totalProducts || 0,
        totalOrders,
        totalRevenue,
        averageRating,
        totalReviews: reviews?.length || 0,
      },
      error: null,
    };
  },
};