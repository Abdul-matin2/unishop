============================
-- 0001_initial_schema.sql
============================
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

============================
-- 0002_functions_and_triggers.sql
============================
-- UniShop Functions and Triggers
-- Run after 0001_initial_schema.sql

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'admin'
$$;

create or replace function public.is_business()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'business'
$$;

create or replace function public.is_approved_business()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = auth.uid() and b.status = 'approved'
  )
$$;

-- ============================================
-- ORDER ACCESS HELPER (prevents RLS recursion)
-- ============================================

-- Security definer so the orders <-> order_items RLS policies don't
-- recursively evaluate each other (Postgres 42P17). Runs as the function
-- owner, so it bypasses caller RLS — safe because it only answers one
-- question: "may the current user view this order?" (as buyer, admin,
-- or a seller whose products are in it).
create or replace function public.can_view_order(p_order uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order
      and (
        o.buyer_id = auth.uid()
        or public.is_admin()
        or exists (
          select 1 from public.order_items oi
          where oi.order_id = o.id and oi.business_id = auth.uid()
        )
      )
  )
$$;

-- ============================================
-- AUTH TRIGGER: Create profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    v_role
  );

  -- If business role, create a pending business entry if business_name provided
  if v_role = 'business' and new.raw_user_meta_data ->> 'business_name' is not null then
    insert into public.businesses (id, business_name, slug, contact_email)
    values (
      new.id,
      new.raw_user_meta_data ->> 'business_name',
      lower(replace(new.raw_user_meta_data ->> 'business_name', ' ', '-')) || '-' || substr(md5(random()::text), 1, 6),
      new.email
    );
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- TRANSACTIONAL CHECKOUT FUNCTION
-- ============================================

create or replace function public.create_order(
  p_notes text default null,
  p_payment_method text default 'cash_on_pickup',
  p_shipping_address text default null,
  p_contact_phone text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buyer uuid := auth.uid();
  v_order uuid;
  v_number text;
  v_subtotal numeric := 0;
  v_cart record;
begin
  if v_buyer is null then
    raise exception 'not_authenticated';
  end if;

  -- Validate stock and calculate subtotal
  for v_cart in
    select c.product_id, c.quantity, p.price, p.stock_quantity, p.title, p.image_url,
           p.business_id, b.business_name
    from cart_items c
    join products p on p.id = c.product_id and p.is_active
    join businesses b on b.id = p.business_id
    where c.user_id = v_buyer
  loop
    if v_cart.stock_quantity < v_cart.quantity then
      raise exception 'insufficient_stock: %', v_cart.title;
    end if;
    v_subtotal := v_subtotal + (v_cart.price * v_cart.quantity);
  end loop;

  if v_subtotal <= 0 then
    raise exception 'empty_cart';
  end if;

  -- Generate order number
  v_number := 'UNI-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));

  -- Create order
  insert into orders (order_number, buyer_id, subtotal, total, notes, payment_method, shipping_address, contact_phone)
  values (v_number, v_buyer, v_subtotal, v_subtotal, p_notes, p_payment_method, p_shipping_address, p_contact_phone)
  returning id into v_order;

  -- Create order items from cart
  insert into order_items (order_id, product_id, business_id, seller_business_name,
                           product_title, product_image_url, quantity, unit_price, subtotal)
  select v_order, c.product_id, p.business_id, b.business_name,
         p.title, p.image_url, c.quantity, p.price, p.price * c.quantity
  from cart_items c
  join products p on p.id = c.product_id
  join businesses b on b.id = p.business_id
  where c.user_id = v_buyer;

  -- Decrement stock
  update products p
  set stock_quantity = p.stock_quantity - c.quantity
  from cart_items c
  where c.product_id = p.id and c.user_id = v_buyer;

  -- Clear cart
  delete from cart_items where user_id = v_buyer;

  return json_build_object(
    'order_id', v_order,
    'order_number', v_number,
    'total', v_subtotal
  );
end $$;

-- ============================================
-- RATING AGGREGATE TRIGGER
-- ============================================

create or replace function public.update_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p uuid := coalesce(new.product_id, old.product_id);
begin
  update products
  set
    rating_avg = coalesce(
      (select round(avg(rating)::numeric, 1) from reviews where product_id = v_p),
      0
    ),
    rating_count = (select count(*) from reviews where product_id = v_p)
  where id = v_p;
  return null;
end $$;

drop trigger if exists trg_update_product_rating on public.reviews;
create trigger trg_update_product_rating
  after insert or update or delete on public.reviews
  for each row
  execute function public.update_product_rating();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists trg_businesses_updated_at on public.businesses;
create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute function public.update_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

============================
-- 0003_rls_policies.sql
============================
-- UniShop Row Level Security Policies
-- Run after 0001 and 0002

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ============================================
-- PROFILES
-- ============================================

-- Everyone can read their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Admins can view all profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Users can update own profile (non-banned)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid() and not is_banned);

-- Admins can update any profile
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- ============================================
-- BUSINESSES
-- ============================================

-- Everyone can see approved businesses
drop policy if exists "Public can view approved businesses" on public.businesses;
create policy "Public can view approved businesses"
  on public.businesses for select
  using (status = 'approved' or auth.uid() = id or public.is_admin());

-- Auth users with business role can create their business
drop policy if exists "Business users can create own business" on public.businesses;
create policy "Business users can create own business"
  on public.businesses for insert
  with check (
    auth.uid() = id
    and public.is_business()
  );

-- Business owners can update own business
drop policy if exists "Business owners can update own business" on public.businesses;
create policy "Business owners can update own business"
  on public.businesses for update
  using (auth.uid() = id or public.is_admin());

-- ============================================
-- CATEGORIES
-- ============================================

-- Everyone can read active categories
drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
  on public.categories for select
  using (is_active = true or public.is_admin());

-- Admins can manage categories
drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update
  using (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

-- ============================================
-- PRODUCTS
-- ============================================

-- Everyone can view active products
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select
  using (is_active = true or public.is_admin());

-- Business owners can view own products (including inactive)
drop policy if exists "Business can view own products" on public.products;
create policy "Business can view own products"
  on public.products for select
  using (
    business_id in (
      select id from public.businesses where id = auth.uid()
    ) or public.is_admin()
  );

-- Approved businesses can create products
drop policy if exists "Approved businesses can create products" on public.products;
create policy "Approved businesses can create products"
  on public.products for insert
  with check (public.is_approved_business() or public.is_admin());

-- Business owners can update own products
drop policy if exists "Business can update own products" on public.products;
create policy "Business can update own products"
  on public.products for update
  using (
    business_id in (
      select id from public.businesses where id = auth.uid()
    ) or public.is_admin()
  );

-- Business owners can delete own products
drop policy if exists "Business can delete own products" on public.products;
create policy "Business can delete own products"
  on public.products for delete
  using (
    business_id in (
      select id from public.businesses where id = auth.uid()
    ) or public.is_admin()
  );

-- ============================================
-- CART ITEMS
-- ============================================

-- Users can manage own cart
drop policy if exists "Users can view own cart" on public.cart_items;
create policy "Users can view own cart"
  on public.cart_items for select
  using (user_id = auth.uid());

drop policy if exists "Users can add to own cart" on public.cart_items;
create policy "Users can add to own cart"
  on public.cart_items for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update own cart" on public.cart_items;
create policy "Users can update own cart"
  on public.cart_items for update
  using (user_id = auth.uid());

drop policy if exists "Users can remove from own cart" on public.cart_items;
create policy "Users can remove from own cart"
  on public.cart_items for delete
  using (user_id = auth.uid());

-- ============================================
-- ORDERS
-- ============================================

-- Buyers, admins, and sellers can view orders they're involved with.
-- Delegated to the security-definer helper can_view_order() so the
-- orders <-> order_items policies don't recurse on each other (42P17).
drop policy if exists "Buyers can view own orders" on public.orders;
drop policy if exists "Sellers can view orders with their products" on public.orders;
create policy "Users can view accessible orders"
  on public.orders for select
  using (public.can_view_order(id));

-- Buyers can cancel own orders with 'placed' status
drop policy if exists "Buyers can cancel placed orders" on public.orders;
create policy "Buyers can cancel placed orders"
  on public.orders for update
  using (
    buyer_id = auth.uid()
    and status = 'placed'
  );

-- Admins can update any order
drop policy if exists "Admins can update any order" on public.orders;
create policy "Admins can update any order"
  on public.orders for update
  using (public.is_admin());

-- ============================================
-- ORDER ITEMS
-- ============================================

-- Read access follows order access (via the same helper)
drop policy if exists "Order items follow order access" on public.order_items;
create policy "Order items follow order access"
  on public.order_items for select
  using (public.can_view_order(order_id));

-- ============================================
-- REVIEWS
-- ============================================

-- Everyone can read reviews
drop policy if exists "Public can view reviews" on public.reviews;
create policy "Public can view reviews"
  on public.reviews for select
  using (true);

-- Authenticated users can create reviews.
-- One review per user per product is enforced by the unique constraint
-- on (product_id, user_id) in the schema, so no `new` subquery is needed here.
drop policy if exists "Users can create reviews" on public.reviews;
create policy "Users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- Users can update own reviews
drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
  on public.reviews for update
  using (user_id = auth.uid());

-- Users can delete own reviews
drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews"
  on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

-- ============================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================

-- Anyone can subscribe
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only admins can view subscribers
drop policy if exists "Admins can view subscribers" on public.newsletter_subscribers;
create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select
  using (public.is_admin());

============================
-- 0004_seed_categories.sql
============================
-- UniShop Seed Categories
-- Run after 0001-0003

insert into public.categories (slug, name, description, icon, sort_order, is_active) values
  ('textbooks', 'Textbooks & Supplies', 'Course materials, notebooks, and stationery', 'BookOpen', 0, true),
  ('electronics', 'Electronics', 'Gadgets, accessories, and tech essentials', 'Laptop', 1, true),
  ('fashion', 'Fashion', 'Clothing, shoes, and accessories', 'Shirt', 2, true),
  ('services', 'Services', 'Tutoring, printing, and campus services', 'Wrench', 3, true),
  ('food', 'Food & Drinks', 'Snacks, meals, and beverages', 'Coffee', 4, true),
  ('housing', 'Housing', 'Accommodation and dorm essentials', 'Home', 5, true),
  ('other', 'Other', 'Everything else you need for campus life', 'Package', 6, true)
on conflict (slug) do nothing;

============================
-- 0005_storage_buckets.sql
============================
-- UniShop Storage Buckets
-- Run after 0001-0003

-- Create storage buckets
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================

-- Anyone can view product images (public bucket)
drop policy if exists "Public read access for product images" on storage.objects;
create policy "Public read access for product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Authenticated users can upload to their own folder
drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own images
drop policy if exists "Users can update own product images" on storage.objects;
create policy "Users can update own product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own images
drop policy if exists "Users can delete own product images" on storage.objects;
create policy "Users can delete own product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- BUSINESS LOGOS POLICIES
-- ============================================

-- Anyone can view business logos (public bucket)
drop policy if exists "Public read access for business logos" on storage.objects;
create policy "Public read access for business logos"
  on storage.objects for select
  using (bucket_id = 'business-logos');

-- Authenticated users can upload to their own folder
drop policy if exists "Authenticated users can upload business logos" on storage.objects;
create policy "Authenticated users can upload business logos"
  on storage.objects for insert
  with check (
    bucket_id = 'business-logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own logos
drop policy if exists "Users can update own business logos" on storage.objects;
create policy "Users can update own business logos"
  on storage.objects for update
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own logos
drop policy if exists "Users can delete own business logos" on storage.objects;
create policy "Users can delete own business logos"
  on storage.objects for delete
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

============================
-- 0006_messages_and_wishlist.sql
============================
-- UniShop Wishlist + Messaging
-- Run after 0001–0005. Idempotent: safe to re-run.

-- ============================================
-- WISHLIST
-- ============================================

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

-- Users can manage their own wishlist
drop policy if exists "Users can view own wishlist" on public.wishlist_items;
create policy "Users can view own wishlist"
  on public.wishlist_items for select
  using (user_id = auth.uid());

drop policy if exists "Users can add to own wishlist" on public.wishlist_items;
create policy "Users can add to own wishlist"
  on public.wishlist_items for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can remove from own wishlist" on public.wishlist_items;
create policy "Users can remove from own wishlist"
  on public.wishlist_items for delete
  using (user_id = auth.uid());

-- ============================================
-- MESSAGING: conversations + messages
-- ============================================

-- A conversation links a buyer to a business. It may be tied to an order
-- (order thread) or a product (product inquiry). businesses.id is the
-- owner's auth user id (1:1), so RLS can compare business_id to auth.uid().
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  subject text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_buyer_idx on public.conversations(buyer_id);
create index if not exists conversations_business_idx on public.conversations(business_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_created_idx
  on public.messages(conversation_id, created_at);

-- Bump the conversation's updated_at whenever a message is added so the
-- inbox can sort by recency. Security definer: the message sender has
-- INSERT on messages but not UPDATE on conversations.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end $$;

drop trigger if exists trg_touch_conversation on public.messages;
create trigger trg_touch_conversation
  after insert on public.messages
  for each row
  execute function public.touch_conversation();

-- Keep conversations.updated_at in sync on any other update.
drop trigger if exists trg_conversations_updated_at on public.conversations;
create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute function public.update_updated_at();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- ============================================
-- MESSAGING RLS
-- ============================================

-- Participants (buyer or business owner) can view their conversations.
drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  using (buyer_id = auth.uid() or business_id = auth.uid());

-- Buyers start conversations (with check keeps them honest).
drop policy if exists "Buyers can create conversations" on public.conversations;
create policy "Buyers can create conversations"
  on public.conversations for insert
  with check (buyer_id = auth.uid() and business_id is not null);

-- Message access follows conversation access (one-directional, no recursion).
drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select
  using (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or business_id = auth.uid()
    )
  );

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or business_id = auth.uid()
    )
  );

-- Participants can mark messages as read.
drop policy if exists "Participants can mark messages read" on public.messages;
create policy "Participants can mark messages read"
  on public.messages for update
  using (
    conversation_id in (
      select id from public.conversations
      where buyer_id = auth.uid() or business_id = auth.uid()
    )
  );

============================
-- 0007_product_location_institution.sql
============================
-- UniShop — product location + institution (Ghanaian institutions)
-- Run after 0006. Idempotent: safe to re-run.

-- Where the buyer meets/picks up the item (required at form level).
alter table public.products
  add column if not exists location text;

-- Ghanaian institution the listing is tied to (optional, curated list).
alter table public.products
  add column if not exists institution text;

