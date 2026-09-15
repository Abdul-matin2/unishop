-- UniShop — per-listing WhatsApp + call numbers
-- Run after 0007. Idempotent: safe to re-run.

-- Number buyers reach the seller on WhatsApp (used by the WhatsApp button).
alter table public.products
  add column if not exists whatsapp_number text;

-- Number buyers dial to call the seller (used by the Call button).
alter table public.products
  add column if not exists call_number text;