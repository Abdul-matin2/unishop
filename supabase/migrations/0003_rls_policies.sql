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
