-- UniShop Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- profiles — 1:1 with auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'student'
    check (role in ('student', 'business', 'admin')),
  phone text,
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- businesses — 1:1 with profiles, gated by approval
create table if not exists public.businesses (
  id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  contact_email text,
  phone text,
  address text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  title text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price is null or original_price >= price),
  image_url text,
  image_urls text[] not null default '{}',
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  condition text not null default 'new'
    check (condition in ('new', 'like_new', 'good', 'fair', 'used')),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating_avg numeric(2,1) not null default 0,
  rating_count int not null default 0,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_business_idx on public.products(business_id);
create index if not exists products_featured_idx on public.products(is_featured) where is_featured;
create index if not exists products_search_idx on public.products using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- cart_items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  buyer_id uuid not null references public.profiles(id),
  status text not null default 'placed'
    check (status in ('placed', 'paid', 'shipped', 'completed', 'cancelled')),
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  notes text,
  payment_method text not null default 'cash_on_pickup',
  shipping_address text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_idx on public.orders(buyer_id);

-- order_items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  business_id uuid not null references public.businesses(id),
  seller_business_name text not null,
  product_title text not null,
  product_image_url text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) not null
);

create index if not exists order_items_business_idx on public.order_items(business_id);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- newsletter_subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
