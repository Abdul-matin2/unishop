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
