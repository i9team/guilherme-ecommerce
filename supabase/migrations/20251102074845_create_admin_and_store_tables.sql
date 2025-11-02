/*
  # Create Admin and Store Tables

  1. New Tables
    - `admins` - Admin users who can manage the store
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text, default 'admin')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `site_config` - Store configuration and branding
      - `id` (uuid, primary key)
      - `site_name` (text)
      - `logo` (text, URL)
      - `favicon` (text, URL)
      - `tagline` (text)
      - `description` (text)
      - `primary_color` (text)
      - `secondary_color` (text)
      - `accent_color` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      - `contact_whatsapp` (text)
      - `social_instagram` (text)
      - `social_facebook` (text)
      - `social_twitter` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `products` - Product catalog
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `price` (decimal)
      - `discount_price` (decimal, nullable)
      - `category` (text)
      - `subcategory` (text)
      - `main_image` (text, URL)
      - `images` (jsonb, array of URLs)
      - `description` (text)
      - `variations` (jsonb)
      - `stock` (integer)
      - `rating` (decimal)
      - `review_count` (integer)
      - `active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `banners` - Promotional banners
      - `id` (uuid, primary key)
      - `image` (text, URL)
      - `title` (text)
      - `subtitle` (text)
      - `link` (text)
      - `position` (integer)
      - `active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can manage all data
    - Public can read active products and banners
    - Public can read site_config
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'Loja Premium',
  logo text DEFAULT '',
  favicon text DEFAULT '',
  tagline text DEFAULT 'Qualidade e estilo para você',
  description text DEFAULT 'Encontre os melhores produtos',
  primary_color text DEFAULT 'slate',
  secondary_color text DEFAULT 'gray',
  accent_color text DEFAULT 'blue',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  contact_whatsapp text DEFAULT '',
  social_instagram text DEFAULT '',
  social_facebook text DEFAULT '',
  social_twitter text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price decimal(10,2) NOT NULL,
  discount_price decimal(10,2),
  category text NOT NULL,
  subcategory text NOT NULL,
  main_image text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  description text DEFAULT '',
  variations jsonb DEFAULT '[]'::jsonb,
  stock integer DEFAULT 0,
  rating decimal(2,1) DEFAULT 0,
  review_count integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  link text DEFAULT '/products',
  position integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to admins table"
  ON admins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Public can read site config"
  ON site_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update site config"
  ON site_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Public can read active banners"
  ON banners FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

INSERT INTO site_config (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
