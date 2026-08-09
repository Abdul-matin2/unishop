// UniShop Supabase connection test.
// Verifies both the publishable (anon) and secret (service_role) keys work.
// Usage: node scripts/test-connection.mjs

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("URL:", url);

// 1. Service role -> auth admin (proves secret key authenticates)
const { data: users, error: adminErr } = await service.auth.admin.listUsers();
if (adminErr) {
  console.log("✖ Service (secret) key — auth admin FAILED:", adminErr.message);
} else {
  console.log(`✓ Service (secret) key — auth admin OK (${users.users.length} user(s) in project)`);
}

// 2. Publishable key -> PostgREST (proves key authenticates; table may not exist yet)
const { error: restErr } = await anon.from("categories").select("id").limit(1);
if (restErr) {
  const msg = restErr.message ?? "";
  if (/relation.*does not exist|42P01|Could not find the table/i.test(msg)) {
    console.log("✓ Publishable (anon) key — REST auth OK (categories table not migrated yet)");
  } else {
    console.log("✖ Publishable (anon) key — REST FAILED:", msg);
  }
} else {
  console.log("✓ Publishable (anon) key — REST OK (categories table reachable)");
}
