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
