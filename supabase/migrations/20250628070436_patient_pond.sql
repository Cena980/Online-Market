/*
  # User Management System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `user_type` (enum: customer, business_owner)
      - `full_name` (text)
      - `phone` (text, optional)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `business_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `business_name` (text)
      - `business_description` (text, optional)
      - `business_address` (text, optional)
      - `business_phone` (text, optional)
      - `business_email` (text, optional)
      - `tax_id` (text, optional)
      - `is_verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for business owners to manage their business data
*/

-- Create enum for user types
CREATE TYPE user_type_enum AS ENUM ('customer', 'business_owner');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type_enum NOT NULL DEFAULT 'customer',
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_description text,
  business_address text,
  business_phone text,
  business_email text,
  tax_id text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for business_profiles
CREATE POLICY "Business owners can read own business profile"
  ON business_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Business owners can update own business profile"
  ON business_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Business owners can insert own business profile"
  ON business_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Public can read verified business profiles
CREATE POLICY "Public can read verified business profiles"
  ON business_profiles
  FOR SELECT
  TO anon, authenticated
  USING (is_verified = true);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((new.raw_user_meta_data->>'user_type')::user_type_enum, 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();