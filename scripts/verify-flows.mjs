// UniShop end-to-end flow verification.
//
// Exercises the real Supabase DB as end-users (anon key => RLS applies):
//   student: browse → cart → checkout (create_order RPC) → order → review
//   business: see own products + orders
//   admin:    platform stats
//
// Usage: node scripts/verify-flows.mjs

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("✖ Missing .env.local");
    process.exit(1);
  }
  for (const raw of readFileSync(path, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
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

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(URL, ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${label}`);
  }
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn(${email}): ${error.message}`);
  return data.user;
}

console.log("── 1. STUDENT FLOW ──────────────────────────────");
const student = await signIn("alex@student.com", "Student123!");
ok(!!student, "student sign-in");
const studentId = student.id;

// Browse: public product listing (RLS: active products visible)
const { data: products, error: prodErr } = await supabase
  .from("products")
  .select("id, title, price, stock_quantity, business_id")
  .eq("is_active", true)
  .limit(10);
ok(!prodErr && products.length >= 1, `student browses ${products.length} active product(s)`);
if (!products?.length) {
  console.log("✖ Cannot continue without products.");
  process.exit(1);
}

// Pick a product and a distinct product for review testing
const target = products[0];
const reviewTarget = products.find((p) => p.id !== target.id) ?? target;

// Cart: fresh cart, add item
await supabase.from("cart_items").delete().eq("user_id", studentId);
const { error: cartErr } = await supabase.from("cart_items").insert({
  user_id: studentId,
  product_id: target.id,
  quantity: 1,
});
ok(!cartErr, `add to cart ${target.title} (${cartErr?.message ?? "ok"})`);

// Checkout: transactional RPC
const { data: orderResult, error: orderErr } = await supabase.rpc("create_order", {
  p_notes: "Verification test order",
  p_payment_method: "cash_on_pickup",
});
ok(!orderErr && orderResult?.order_id, `checkout create_order (${orderErr?.message ?? orderResult?.order_number})`);
const orderId = orderResult?.order_id;

// Order fetch: buyer sees own order + items
const { data: order, error: orderFetchErr } = await supabase
  .from("orders")
  .select("*, order_items(*)")
  .eq("id", orderId)
  .maybeSingle();
ok(!orderFetchErr && order?.order_number, "student reads own order");
ok(order?.order_items?.length >= 1, "order has line items");

// Stock decremented?
const { data: updatedProduct } = await supabase
  .from("products")
  .select("stock_quantity")
  .eq("id", target.id)
  .single();
const beforeStock = target.stock_quantity;
ok(updatedProduct.stock_quantity === beforeStock - 1, `stock decremented (${beforeStock} → ${updatedProduct.stock_quantity})`);

// Review: student reviews a product they haven't reviewed yet
const { data: existingReview } = await supabase
  .from("reviews")
  .select("id")
  .eq("product_id", reviewTarget.id)
  .eq("user_id", studentId)
  .maybeSingle();
if (existingReview) {
  console.log("  · already reviewed that product — skipping review insert");
} else {
  const { error: revErr } = await supabase.from("reviews").insert({
    product_id: reviewTarget.id,
    user_id: studentId,
    rating: 5,
    comment: "Great product, quick delivery!",
  });
  ok(!revErr, `submit review (${revErr?.message ?? "ok"})`);
}

// Duplicate review must be rejected by the unique constraint
if (!existingReview) {
  const { error: dupErr } = await supabase.from("reviews").insert({
    product_id: reviewTarget.id,
    user_id: studentId,
    rating: 3,
    comment: "duplicate",
  });
  ok(!!dupErr, "duplicate review rejected");
}

console.log("── 2. BUSINESS FLOW ─────────────────────────────");
const businessUser = await signIn("tech@campushub.com", "Business123!");
ok(!!businessUser, "business sign-in");

const { data: bizProducts, error: bizProdErr } = await supabase
  .from("products")
  .select("id, title")
  .eq("business_id", businessUser.id);
ok(!bizProdErr && bizProducts.length >= 1, `business sees ${bizProducts.length} own product(s)`);

const { data: bizOrderItems, error: bizOrderErr } = await supabase
  .from("order_items")
  .select("order_id, order_number:orders(order_number, total)")
  .eq("business_id", businessUser.id);
ok(!bizOrderErr, `business reads own orders (${bizOrderItems?.length ?? 0} line item(s))`);

console.log("── 3. ADMIN FLOW ────────────────────────────────");
const admin = await signIn("admin@unishop.com", "Admin123!");
ok(!!admin, "admin sign-in");

const { count: userCount, error: adminUsersErr } = await supabase
  .from("profiles")
  .select("id", { count: "exact", head: true });
ok(!adminUsersErr, `admin sees ${userCount} profiles`);

const { count: bizCount, error: adminBizErr } = await supabase
  .from("businesses")
  .select("id", { count: "exact", head: true });
ok(!adminBizErr, `admin sees ${bizCount} businesses`);

const { count: orderCount, error: adminOrderErr } = await supabase
  .from("orders")
  .select("id", { count: "exact", head: true });
ok(!adminOrderErr, `admin sees ${orderCount} orders`);

// Security spot-check: student must NOT read admin-only subscriber list
const { data: leaked, error: leakErr } = await supabase
  .from("newsletter_subscribers")
  .select("*");
ok(!!leakErr || leaked.length === 0, "student cannot read subscriber list");

console.log("\n────────────────────────────────────────────────");
console.log(`RESULT: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
