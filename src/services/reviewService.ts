import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type ProductReview = Database['public']['Tables']['product_reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['product_reviews']['Insert'];
type ReviewUpdate = Database['public']['Tables']['product_reviews']['Update'];

export const reviewService = {
  // Get reviews for a product
  async getProductReviews(productId: string, limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  },

  // Create a review
  async createReview(review: ReviewInsert) {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert(review)
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .single();

    return { data, error };
  },

  // Update a review
  async updateReview(id: string, updates: ReviewUpdate) {
    const { data, error } = await supabase
      .from('product_reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .single();

    return { data, error };
  },

  // Delete a review
  async deleteReview(id: string) {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', id);

    return { error };
  },

  // Mark review as helpful/unhelpful
  async markReviewHelpful(reviewId: string, isHelpful: boolean) {
    const { data, error } = await supabase
      .from('review_helpfulness')
      .upsert({
        review_id: reviewId,
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        is_helpful: isHelpful,
      });

    return { data, error };
  },

  // Get review statistics for a product
  async getReviewStats(productId: string) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) return { data: null, error };

    const totalReviews = data.length;
    const averageRating = totalReviews > 0 
      ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: data.filter(review => review.rating === rating).length,
    }));

    return {
      data: {
        totalReviews,
        averageRating,
        ratingDistribution,
      },
      error: null,
    };
  },
};