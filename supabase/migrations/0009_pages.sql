-- UniShop Manageable Pages
-- Admin-editable content pages (About, Contact, FAQ, Help Center, Shipping,
-- Returns, Privacy). Run in the Supabase SQL Editor. Safe to re-run.

-- ============================================
-- TABLE
-- ============================================

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  content text not null default '',
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.pages enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Everyone can read published pages; admins can read all.
drop policy if exists "Public can view published pages" on public.pages;
create policy "Public can view published pages"
  on public.pages for select
  using (is_published = true or public.is_admin());

-- Only admins can create, edit, or delete pages.
drop policy if exists "Admins can insert pages" on public.pages;
create policy "Admins can insert pages"
  on public.pages for insert
  with check (public.is_admin());

drop policy if exists "Admins can update pages" on public.pages;
create policy "Admins can update pages"
  on public.pages for update
  using (public.is_admin());

drop policy if exists "Admins can delete pages" on public.pages;
create policy "Admins can delete pages"
  on public.pages for delete
  using (public.is_admin());

-- ============================================
-- SEED — the seven public pages
-- ============================================
-- Content uses simple formatting: ## = heading, ### = sub-heading,
-- "- " lines = bullets, blank line = new paragraph.

insert into public.pages (slug, title, subtitle, content) values
('about', 'About UniShop', 'A student marketplace built to make campus commerce simple, safe, and affordable.', $q$
## Our mission
UniShop connects students with trusted campus businesses for textbooks, electronics, fashion, food, and more — all at student-friendly prices. Instead of long delivery waits and impersonal online marketplaces, buyers deal directly with sellers through in-app chat, calls, or WhatsApp.

## What we stand for
- Made for students: affordable prices, campus-friendly pickup, and deals that fit a student budget.
- Trusted businesses: every business is vetted, with verified buyer reviews on each product.
- Direct contact: message, call, or WhatsApp the seller — no middlemen and no hidden fees.
- Campus local: find sellers near your institution and pick up in person.

## How UniShop works
- Browse: search products by category or institution and compare prices.
- Contact the seller: chat in-app, or call and WhatsApp the seller to ask questions and negotiate.
- Meet and pay: arrange pickup or local delivery with the seller and pay on the spot.

## Join UniShop
Browse thousands of products from trusted campus businesses, or become a seller and reach students today. Create a free account to get started.
$q$),
('contact', 'Contact Us', 'We are here to help you shop, sell, or sort out an order. Reach us on any channel below.', $q$
## How to reach us
- Email: support@unishop.app — we reply within 24 hours on weekdays.
- Call: +233 000 000 000 — Monday to Friday, 9am to 5pm GMT.
- WhatsApp: +233 000 000 000 — the fastest way to reach support.
- Campus desk: Student Support Office, main library block, Accra Campus.

## Support hours
- Monday to Friday: 9am to 5pm.
- Saturday: 10am to 2pm.
- Sundays and holidays: closed.

## Send us a message
Complete the form on this page or email support@unishop.app directly. Include your order or product details so we can help you faster.
$q$),
('faq', 'Frequently Asked Questions', 'Quick answers to the most common questions. Can not find yours? Contact support.', $q$
## Buying on UniShop
### How do I contact a seller?
Open a product and choose Call or WhatsApp to reach the seller directly, or use the in-app message button to ask a question. Sellers list a WhatsApp number and a call number on every product.
### Can I negotiate the price?
Yes. Most sellers are open to offers — send them a message, call, or WhatsApp chat and agree on a price before arranging pickup.
### How do I pay?
You agree on a price with the seller and pay on pickup or delivery, usually by mobile money or cash.
### Is buying safe?
Businesses are vetted and you can read verified buyer reviews. Always contact the seller, inspect items at pickup, and pay only when satisfied.

## Selling on UniShop
### How do I become a seller?
Create an account, choose the business role during signup, complete onboarding, then list your first product.
### How much does it cost to sell?
Listing products on UniShop is free — no upfront fees or monthly charges.
### How do I add WhatsApp and call numbers?
When creating or editing a product, fill in the Seller Contact section. Buyers see those numbers on the product page.
### Can I manage or delete a product?
Yes — open your seller dashboard, go to My Products, and use the edit, activate, or delete controls.

## Orders, shipping and returns
### Do you deliver, or do I pick up?
Most businesses offer pickup or short-distance local delivery. Options and timing are agreed with the seller. See the Shipping page for details.
### Can I return a product?
Yes, within the window agreed with the seller. Inspect items at pickup so you can raise any issue immediately. See the Returns page.
### What if the item is not what I expected?
Contact the seller right away through chat, call, or WhatsApp. If you cannot agree, reach our support team with your order details.

## Accounts and troubleshooting
### I cannot sign in.
Double-check your email and password, then reset your password from the login page. Contact support if it still fails.
### How do I update my profile or institution?
Open your profile page from the account menu and edit your details.
### How is my data protected?
We only collect what is needed to run the marketplace and never sell your data. See the Privacy Policy for details.
$q$),
('help', 'Help Center', 'Everything you need to get the most out of UniShop — whether you are buying or selling.', $q$
## Find your answer
- Accounts and login: create an account, reset your password, and manage your profile and institution.
- Pickup and delivery: how pickup and local delivery work, and how to arrange them with a seller.
- Messaging sellers: use in-app chat, calls, and WhatsApp to ask questions and negotiate prices.
- Staying safe: verified businesses, buyer reviews, and tips for inspecting items at pickup.
- Selling guides: list products, add contact numbers, manage stock, and track your seller dashboard.
- Returns and refunds: return windows, condition checks, and how to raise an issue with a seller.

## Popular topics
- FAQ: quick answers to the most common questions — visit /faq.
- Shipping and delivery: options, timelines, and how pickup works — visit /shipping.
- Returns: the return window and how to return an item — visit /returns.

## Still need help?
Contact our support team through the Contact page. We reply within 24 hours on weekdays.
$q$),
('shipping', 'Shipping & Delivery', 'UniShop is built for campus life — most orders are picked up locally or delivered nearby.', $q$
## Delivery options
- Campus pickup: arrange a time and location with the seller on campus — free, same-day, and you inspect the item before paying.
- Local delivery: many sellers offer short-distance delivery around their campus. Fees and timing are agreed directly with the seller.
- Nationwide shipping: some sellers ship within Ghana via courier. Fees and estimated time of arrival are set per product by the seller.

## Timelines and costs
- Campus pickup: same day — free.
- Local delivery: 1 to 2 days — agreed with the seller.
- Nationwide shipping: 2 to 5 days — set by the seller.

## Things to know
Timing is agreed with the seller: confirm the time, location, and any fee before completing the sale.
Payment happens at delivery: for local orders you usually pay when you receive the item.
For sellers: state whether you offer pickup or delivery and your usual timeline when listing a product.
$q$),
('returns', 'Returns & Refunds', 'We want you to love what you buy. Here is how returns work on UniShop.', $q$
## Return window
Because most UniShop sales are arranged directly between buyer and seller, the return window is set by the individual seller. As a general rule, sellers accept returns within 7 days of delivery or pickup for items that are unused and in their original condition. Agree on return terms with the seller before completing any sale.

## Eligible for return
- Item not as described: the product differs from its listing — wrong item, colour, size, or condition.
- Damaged or defective: the item arrives damaged or does not work as expected.
- Unused with original packaging: item is unused, unwashed, and returned with all tags and packaging.

## How to start a return
- Contact the seller first: message, call, or WhatsApp them within the window and explain the issue.
- Return the item: follow the agreed method, usually in-person pickup or courier instructions for shipped orders.
- Receive your refund: refunds go back the same way you paid, usually within 5 to 7 business days.

Can not resolve a return with the seller? Contact support with your order details and we will step in to help.
$q$),
('privacy', 'Privacy Policy', 'Your privacy matters — here is exactly how we handle your data.', $q$
## Information we collect
We collect what you provide when you create an account — name, email address, phone number, role, and institution. When you list a product or contact a seller, we store those details to keep the marketplace running. Payment information is handled by payment providers and is not stored on our servers.

## How we use your information
We use your information to manage your account, process listings and orders, let buyers and sellers contact each other, improve our services, and send important account notifications. We never sell your personal data.

## Sharing your information
Your contact details are shared only when necessary: with the seller or buyer you are transacting with, and with service providers who help us operate the platform under strict confidentiality agreements.

## Cookies and local storage
We use cookies and local storage to keep you signed in, remember preferences, and understand how the marketplace is used. You can disable cookies in your browser, though some features may not work as smoothly.

## Data security
We protect your data with industry-standard safeguards, including encrypted connections and access controls.

## Your rights
Review, update, or delete your account information any time from your profile page. You may also ask us to close your account or request a copy of the data we hold — contact support and we will act within 30 days.

## Contact us
Questions about this policy or your data? Email support@unishop.app. We respond within 24 hours on weekdays.
$q$)
on conflict (slug) do nothing;