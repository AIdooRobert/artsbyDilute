import { createClient } from "@supabase/supabase-js";

const [email, displayName = "SnapFolio Admin"] = process.argv.slice(2);

if (!email) {
  console.error(
    "Usage: npm run admin:create -- admin@example.com \"Display Name\"",
  );
  process.exit(1);
}

async function readSecret(prompt) {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    throw new Error(
      "Run this command in an interactive terminal or set ADMIN_PASSWORD.",
    );
  }

  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    let value = "";
    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.off("data", onData);
      process.stdout.write("\n");
      resolve(value);
    };
    const onData = (key) => {
      if (key === "\u0003") {
        process.stdin.setRawMode(false);
        reject(new Error("Cancelled."));
        return;
      }
      if (key === "\r" || key === "\n") {
        finish();
        return;
      }
      if (key === "\u007f" || key === "\b") {
        if (value) {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }
      value += key;
      process.stdout.write("*");
    };
    process.stdin.on("data", onData);
  });
}

const password = await readSecret("Temporary password: ");
if (password.length < 12) {
  throw new Error("Use a temporary password containing at least 12 characters.");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data, error } = await supabase.auth.admin.createUser({
  email: email.toLowerCase(),
  password,
  email_confirm: true,
  user_metadata: { role: "admin", display_name: displayName },
});

if (error) throw error;

const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin", display_name: displayName })
  .eq("id", data.user.id);
if (profileError) throw profileError;

console.log(`Admin created: ${email.toLowerCase()}`);
