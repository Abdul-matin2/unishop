// UniShop database seed script.
//
// Creates demo users (admin / business / student), an approved demo business,
// products, reviews, and sample orders.
//
// Usage:
//   1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
//   2. Run:  node scripts/seed.mjs
//
// Idempotent: safe to run multiple times (existing users/products are reused).

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------
// Minimal .env.local loader (no extra deps)
// ---------------------------------------------------------------
function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("✖ Missing .env.local — copy .env.example and fill in your Supabase keys first.");
    process.exit(1);
  }
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ---------------------------------------------------------------
// Demo accounts (printed at the end)
// ---------------------------------------------------------------
const DEMO = {
  admin: {
    email: "admin@unishop.com",
    password: "Admin123!",
    fullName: "UniShop Admin",
    meta: { role: "admin", full_name: "UniShop Admin" },
  },
  business: {
    email: "tech@campushub.com",
    password: "Business123!",
    fullName: "John Carter",
    businessName: "Campus Tech Hub",
    businessDescription: "Your one-stop shop for electronics and tech accessories.",
    address: "Student Center, Room 101",
    phone: "+233 20 000 0001",
    meta: null, // set below
  },
  student: {
    email: "alex@student.com",
    password: "Student123!",
    fullName: "Alex Johnson",
    meta: { role: "student", full_name: "Alex Johnson" },
  },
};
DEMO.business.meta = {
  role: "business",
  full_name: DEMO.business.fullName,
  business_name: DEMO.business.businessName,
};

const PRODUCTS = [
  {
    title: "Wireless Bluetooth Headphones",
    description:
      "Premium noise-cancelling headphones with 30-hour battery life. Perfect for studying in the library or listening to lectures.",
    price: 299.99,
    original_price: 499.99,
    stock: 25,
    condition: "new",
    featured: true,
    category: "electronics",
  },
  {
    title: "USB-C Hub Adapter 7-in-1",
    description:
      "Multi-port adapter with HDMI, USB 3.0, SD card reader, and PD charging.",
    price: 199.99,
    original_price: null,
    stock: 40,
    condition: "new",
    featured: false,
    category: "electronics",
  },
  {
    title: "Mechanical Gaming Keyboard",
    description:
      "Hot-swappable RGB mechanical keyboard with brown switches. Great for coding marathons and late-night assignments.",
    price: 249.99,
    original_price: 349.99,
    stock: 15,
    condition: "new",
    featured: false,
    category: "electronics",
  },
  {
    title: "Calculus: Early Transcendentals (8th Ed.)",
    description:
      "Standard calculus textbook required for MATH 101-301. Light wear, all pages intact.",
    price: 120.0,
    original_price: 350.0,
    stock: 8,
    condition: "good",
    featured: false,
    category: "textbooks",
  },
  {
    title: "Linear Algebra and Its Applications",
    description:
      "Introductory linear algebra textbook in good condition with some highlighting in the first two chapters.",
    price: 85.0,
    original_price: 240.0,
    stock: 6,
    condition: "good",
    featured: false,
    category: "textbooks",
  },
  {
    title: "Organic Chemistry, 7th Edition",
    description:
      "Required for CHEM 201. Minimal wear, comes with the online access code unused.",
    price: 150.0,
    original_price: 400.0,
    stock: 3,
    condition: "like_new",
    featured: false,
    category: "textbooks",
  },
  {
    title: "Campus Tech Hoodie",
    description:
      "Comfortable cotton-blend hoodie with the UniShop logo. Available in sizes S-XXL.",
    price: 60.0,
    original_price: 90.0,
    stock: 50,
    condition: "new",
    featured: true,
    category: "fashion",
  },
  {
    title: "Stainless Steel Water Bottle",
    description:
      "Double-wall insulated bottle that keeps drinks cold for 24 hours. 750ml.",
    price: 45.0,
    original_price: null,
    stock: 30,
    condition: "new",
    featured: false,
    category: "other",
  },
];

const REVIEWS = [
  { rating: 5, comment: "Amazing quality and fast delivery. Highly recommend!" },
  { rating: 4, comment: "Great product, exactly as described." },
  { rating: 5, comment: "Best price on campus for this. Will buy again." },
];

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createUser(account) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: account.meta,
  });

  if (!error) return data.user;

  // Idempotency: user already exists -> look it up
  if (error.status === 422 || /already/i.test(error.message)) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing.users.find((u) => u.email === account.email);
    if (found) {
      console.log(`   ↳ ${account.email} already exists, reusing.`);
      return found;
    }
  }
  throw error;
}

async function ensureCategories() {
  const { data, error } = await supabase.from("categories").select("id, slug");
  if (error) throw error;
  if (!data.length) {
    console.error("✖ No categories found — did you run the migrations (0004 seeds categories)?");
    process.exit(1);
  }
  return new Map(data.map((c) => [c.slug, c.id]));
}

// ---------------------------------------------------------------
// Seed
// ---------------------------------------------------------------
console.log("🚀 Seeding UniShop…\n");

// 1. Users + business
console.log("👤 Creating demo users…");
await createUser(DEMO.admin);
const businessUser = await createUser(DEMO.business);
const studentUser = await createUser(DEMO.student);

// 2. Approve the demo business (created as 'pending' by the signup trigger)
console.log("🏪 Approving demo business…");
const { error: bizErr } = await supabase
  .from("businesses")
  .update({ status: "approved", approved_at: new Date().toISOString() })
  .eq("id", businessUser.id);
if (bizErr) {
  console.warn("   ⚠ Could not approve business:", bizErr.message);
}

// 3. Products
const categories = await ensureCategories();
console.log("📦 Creating products…");
const { data: existingProducts } = await supabase
  .from("products")
  .select("id")
  .eq("business_id", businessUser.id);
const haveProducts = (existingProducts?.length ?? 0) > 0;

let productIds = [];
if (!haveProducts) {
  const { data: inserted, error: prodErr } = await supabase
    .from("products")
    .insert(
      PRODUCTS.map((p) => ({
        business_id: businessUser.id,
        category_id: categories.get(p.category),
        title: p.title,
        slug: `${slugify(p.title)}-${businessUser.id.slice(0, 6)}`,
        description: p.description,
        price: p.price,
        original_price: p.original_price,
        stock_quantity: p.stock,
        condition: p.condition,
        is_active: true,
        is_featured: p.featured,
        image_url: null,
        image_urls: [],
      }))
    )
    .select("id");
  if (prodErr) throw prodErr;
  productIds = inserted.map((r) => r.id);
  console.log(`   ✓ Created ${productIds.length} products`);
} else {
  productIds = existingProducts.map((r) => r.id);
  console.log(`   ↳ Products already exist (${productIds.length}), skipping.`);
}

// 4. Reviews (only if none exist yet)
console.log("⭐ Adding reviews…");
const { data: existingReviews } = await supabase
  .from("reviews")
  .select("id")
  .eq("user_id", studentUser.id)
  .limit(1);
if (!existingReviews?.length && productIds.length) {
  const sample = productIds.slice(0, Math.min(3, productIds.length));
  const { error: revErr } = await supabase.from("reviews").insert(
    sample.map((pid, i) => ({
      product_id: pid,
      user_id: studentUser.id,
      rating: REVIEWS[i % REVIEWS.length].rating,
      comment: REVIEWS[i % REVIEWS.length].comment,
    }))
  );
  if (revErr) {
    console.warn("   ⚠ Could not add reviews:", revErr.message);
  } else {
    console.log(`   ✓ Added ${sample.length} reviews`);
  }
} else {
  console.log("   ↳ Reviews already exist, skipping.");
}

// 5. Sample order (only if the student has no orders)
console.log("🧾 Creating sample order…");
const { data: existingOrders } = await supabase
  .from("orders")
  .select("id")
  .eq("buyer_id", studentUser.id)
  .limit(1);
if (!existingOrders?.length && productIds.length) {
  const item = productIds[0];
  const { data: product } = await supabase
    .from("products")
    .select("title, price, image_url, business_id")
    .eq("id", item)
    .single();
  if (product) {
    const orderNumber = `UNI-SEED-${Date.now() % 100000}`;
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        buyer_id: studentUser.id,
        status: "completed",
        subtotal: Number(product.price),
        total: Number(product.price),
        payment_method: "cash_on_pickup",
        notes: "Seeded demo order.",
      })
      .select("id")
      .single();
    if (orderErr) {
      console.warn("   ⚠ Could not create order:", orderErr.message);
    } else {
      const { error: itemErr } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: product.id,
        business_id: product.business_id,
        seller_business_name: DEMO.business.businessName,
        product_title: product.title,
        product_image_url: product.image_url,
        quantity: 1,
        unit_price: Number(product.price),
        subtotal: Number(product.price),
      });
      if (itemErr) {
        console.warn("   ⚠ Could not add order item:", itemErr.message);
      } else {
        console.log("   ✓ Created sample order");
      }
    }
  }
} else {
  console.log("   ↳ Orders already exist, skipping.");
}

console.log("\n✅ Seed complete!\n");
console.log("Demo logins:");
console.log(`   Admin    → admin@unishop.com   / Admin123!`);
console.log(`   Business → tech@campushub.com  / Business123!`);
console.log(`   Student  → alex@student.com    / Student123!`);
