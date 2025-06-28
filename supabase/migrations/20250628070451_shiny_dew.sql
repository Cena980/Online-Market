/*
  # Products and Categories System

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, optional)
      - `image_url` (text, optional)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

    - `products`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references business_profiles)
      - `category_id` (uuid, references categories)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `original_price` (decimal, optional)
      - `image_url` (text)
      - `additional_images` (text array, optional)
      - `features` (text array, optional)
      - `stock_quantity` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public can read active products and categories
    - Business owners can manage their own products
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price > 0),
  original_price decimal(10,2) CHECK (original_price IS NULL OR original_price > price),
  image_url text NOT NULL,
  additional_images text[],
  features text[],
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Public can read active categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Policies for products
CREATE POLICY "Public can read active products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND stock_quantity > 0);

CREATE POLICY "Business owners can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Business owners can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Business owners can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Business owners can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

-- Trigger for updated_at on products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, image_url) VALUES
  ('Electronics', 'Electronic devices and gadgets', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),
  ('Fashion', 'Clothing and accessories', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),
  ('Home & Garden', 'Home improvement and garden supplies', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2'),
  ('Sports', 'Sports equipment and accessories', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2');