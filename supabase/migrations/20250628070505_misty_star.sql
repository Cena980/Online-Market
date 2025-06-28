/*
  # Reviews and Ratings System

  1. New Tables
    - `product_reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `user_id` (uuid, references user_profiles)
      - `rating` (integer, 1-5)
      - `title` (text, optional)
      - `comment` (text, optional)
      - `is_verified_purchase` (boolean, default false)
      - `helpful_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `review_helpfulness`
      - `id` (uuid, primary key)
      - `review_id` (uuid, references product_reviews)
      - `user_id` (uuid, references user_profiles)
      - `is_helpful` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only review products once
    - Users can manage their own reviews
    - Public can read reviews
*/

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Create review_helpfulness table
CREATE TABLE IF NOT EXISTS review_helpfulness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;

-- Policies for product_reviews
CREATE POLICY "Public can read reviews"
  ON product_reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON product_reviews
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for review_helpfulness
CREATE POLICY "Public can read review helpfulness"
  ON review_helpfulness
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can mark reviews helpful"
  ON review_helpfulness
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own helpfulness votes"
  ON review_helpfulness
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own helpfulness votes"
  ON review_helpfulness
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at on reviews
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update helpful_count when helpfulness votes change
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE product_reviews 
    SET helpful_count = (
      SELECT COUNT(*) 
      FROM review_helpfulness 
      WHERE review_id = NEW.review_id AND is_helpful = true
    )
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_reviews 
    SET helpful_count = (
      SELECT COUNT(*) 
      FROM review_helpfulness 
      WHERE review_id = OLD.review_id AND is_helpful = true
    )
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update helpful count
CREATE TRIGGER update_helpful_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON review_helpfulness
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();