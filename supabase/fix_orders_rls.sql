-- UniShop incremental fix: orders/order_items RLS recursion (42P17)
--
-- The old orders and order_items SELECT policies referenced each other,
-- causing Postgres to abort with "infinite recursion detected in policy".
-- This delegates both checks to a security-definer helper so no RLS cycle
-- occurs. Safe to run on its own after the main setup.

-- 1. Helper function (bypasses caller RLS => no recursion)
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

-- 2. Replace the two orders SELECT policies with one helper-based policy
drop policy if exists "Buyers can view own orders" on public.orders;
drop policy if exists "Sellers can view orders with their products" on public.orders;
create policy "Users can view accessible orders"
  on public.orders for select
  using (public.can_view_order(id));

-- 3. Replace the order_items SELECT policy with the same helper
drop policy if exists "Order items follow order access" on public.order_items;
create policy "Order items follow order access"
  on public.order_items for select
  using (public.can_view_order(order_id));
