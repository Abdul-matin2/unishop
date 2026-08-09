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
