-- UniShop — product location + institution (Ghanaian institutions)
-- Run after 0006. Idempotent: safe to re-run.

-- Where the buyer meets/picks up the item (required at form level).
alter table public.products
  add column if not exists location text;

-- Ghanaian institution the listing is tied to (optional, curated list).
alter table public.products
  add column if not exists institution text;
