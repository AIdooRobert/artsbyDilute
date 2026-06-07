import { createClient } from "@supabase/supabase-js";

const [email, password, displayName = "SnapFolio Admin"] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [display-name]");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { role: "admin", display_name: displayName },
});

if (error) throw error;

await supabase
  .from("profiles")
  .update({ role: "admin", display_name: displayName })
  .eq("id", data.user.id);

console.log(`Admin created: ${email}`);
