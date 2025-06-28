import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_type: 'customer' | 'business_owner';
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type?: 'customer' | 'business_owner';
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          user_type?: 'customer' | 'business_owner';
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
        };
      };
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_description: string | null;
          business_address: string | null;
          business_phone: string | null;
          business_email: string | null;
          tax_id: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          business_name: string;
          business_description?: string | null;
          business_address?: string | null;
          business_phone?: string | null;
          business_email?: string | null;
          tax_id?: string | null;
        };
        Update: {
          business_name?: string;
          business_description?: string | null;
          business_address?: string | null;
          business_phone?: string | null;
          business_email?: string | null;
          tax_id?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          category_id: string;
          name: string;
          description: string;
          price: number;
          original_price: number | null;
          image_url: string;
          additional_images: string[] | null;
          features: string[] | null;
          stock_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          business_id: string;
          category_id: string;
          name: string;
          description: string;
          price: number;
          original_price?: number | null;
          image_url: string;
          additional_images?: string[] | null;
          features?: string[] | null;
          stock_quantity?: number;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          image_url?: string;
          additional_images?: string[] | null;
          features?: string[] | null;
          stock_quantity?: number;
          is_active?: boolean;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          comment: string | null;
          is_verified_purchase: boolean;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          user_id: string;
          rating: number;
          title?: string | null;
          comment?: string | null;
          is_verified_purchase?: boolean;
        };
        Update: {
          rating?: number;
          title?: string | null;
          comment?: string | null;
        };
      };
      shopping_cart: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          quantity: number;
        };
        Update: {
          quantity?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total_amount: number;
          shipping_address: any;
          billing_address: any | null;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}