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
