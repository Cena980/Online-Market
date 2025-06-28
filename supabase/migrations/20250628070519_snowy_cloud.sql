/*
  # Orders and Shopping Cart System

  1. New Tables
    - `shopping_cart`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `order_number` (text, unique)
      - `status` (enum)
      - `total_amount` (decimal)
      - `shipping_address` (jsonb)
      - `billing_address` (jsonb)
      - `payment_status` (enum)
      - `payment_method` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_price` (decimal)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own cart and orders
*/

-- Create enums
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create shopping_cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status order_status_enum DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL CHECK (total_amount > 0),
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  payment_status payment_status_enum DEFAULT 'pending',
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price > 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for shopping_cart
CREATE POLICY "Users can manage own cart"
  ON shopping_cart
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Business owners can read orders for their products
CREATE POLICY "Business owners can read orders for their products"
  ON orders
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT DISTINCT oi.order_id 
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

-- Policies for order_items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  ));

-- Business owners can read order items for their products
CREATE POLICY "Business owners can read order items for their products"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (product_id IN (
    SELECT p.id 
    FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_shopping_cart_updated_at
  BEFORE UPDATE ON shopping_cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;