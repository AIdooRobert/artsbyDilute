import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const mysqlBin =
  process.env.LEGACY_MYSQL_BIN ?? "C:\\xampp\\mysql\\bin\\mysql.exe";
const legacyRoot =
  process.env.LEGACY_APP_ROOT ?? "C:\\xampp\\htdocs\\SnapFolio";
const legacyDb = process.env.LEGACY_MYSQL_DATABASE ?? "snapfolio_db";
const legacyUser = process.env.LEGACY_MYSQL_USER ?? "root";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function legacyRows(sql) {
  const output = execFileSync(
    mysqlBin,
    [
      "-u",
      legacyUser,
      "-D",
      legacyDb,
      "--batch",
      "--raw",
      "--skip-column-names",
      "-e",
      sql,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        MYSQL_PWD: process.env.LEGACY_MYSQL_PASSWORD ?? "",
      },
    },
  ).trim();

  return output ? output.split(/\r?\n/).map((line) => JSON.parse(line)) : [];
}

async function allAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

function temporaryPassword() {
  return `${randomBytes(32).toString("base64url")}Aa1!`;
}

async function ensureAuthUser(usersByEmail, email, role, displayName) {
  const normalizedEmail = email.toLowerCase();
  let user = usersByEmail.get(normalizedEmail);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: temporaryPassword(),
      email_confirm: true,
      user_metadata: { role, display_name: displayName },
    });
    if (error) throw error;
    user = data.user;
    usersByEmail.set(normalizedEmail, user);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role, display_name: displayName })
    .eq("id", user.id);
  if (profileError) throw profileError;

  return user;
}

function photographerAuthEmail(row, usersByEmail) {
  const email = row.email.toLowerCase();
  const existing = usersByEmail.get(email);
  if (!existing || existing.user_metadata?.role === "photographer") return email;

  const [local, domain] = email.split("@");
  return `${local}+photographer@${domain}`;
}

function imageContentType(filename) {
  switch (path.extname(filename).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

const photographers = legacyRows(`
  select json_object(
    'id', id,
    'username', username,
    'photographer_name', photographer_name,
    'email', email,
    'business_name', business_name,
    'company_name', company_name,
    'company_logo', company_logo,
    'pricing_plan_id', pricing_plan_id,
    'is_active', is_active,
    'created_at', created_at,
    'updated_at', updated_at
  ) from photographers order by id
`);

const clients = legacyRows(`
  select json_object(
    'id', id,
    'photographer_id', photographer_id,
    'client_name', client_name,
    'username', username,
    'email', email,
    'is_active', is_active,
    'created_at', created_at,
    'updated_at', updated_at
  ) from photography_clients order by id
`);

const subscriptions = legacyRows(`
  select json_object(
    'id', id,
    'photographer_id', photographer_id,
    'pricing_plan_id', pricing_plan_id,
    'payment_method', payment_method,
    'phone_number', phone_number,
    'amount', amount,
    'status', status,
    'transaction_id', transaction_id,
    'renewal_date', renewal_date,
    'created_at', created_at,
    'updated_at', updated_at
  ) from subscriptions order by id
`);

const photos = legacyRows(`
  select json_object(
    'id', id,
    'client_id', client_id,
    'filename', filename,
    'display_name', display_name,
    'uploaded_at', uploaded_at
  ) from client_photos order by id
`);

const usersByEmail = new Map(
  (await allAuthUsers())
    .filter((user) => user.email)
    .map((user) => [user.email.toLowerCase(), user]),
);

const { data: plans, error: plansError } = await supabase
  .from("pricing_plans")
  .select("id,slug");
if (plansError) throw plansError;

const planByLegacyId = new Map([
  [1, plans.find((plan) => plan.slug === "basic")?.id],
  [2, plans.find((plan) => plan.slug === "studio")?.id],
  [3, plans.find((plan) => plan.slug === "agency")?.id],
]);

const photographerByLegacyId = new Map();
for (const row of photographers) {
  const authEmail = photographerAuthEmail(row, usersByEmail);
  const authUser = await ensureAuthUser(
    usersByEmail,
    authEmail,
    "photographer",
    row.photographer_name,
  );
  const { data, error } = await supabase
    .from("photographers")
    .upsert(
      {
        auth_user_id: authUser.id,
        username: row.username.toLowerCase(),
        photographer_name: row.photographer_name,
        email: row.email.toLowerCase(),
        business_name: row.business_name,
        company_name: row.company_name,
        company_logo_url: row.company_logo,
        pricing_plan_id: planByLegacyId.get(Number(row.pricing_plan_id)),
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      { onConflict: "username" },
    )
    .select("id")
    .single();
  if (error) throw error;
  photographerByLegacyId.set(Number(row.id), data.id);
}

const clientByLegacyId = new Map();
for (const row of clients) {
  const username = row.username.toLowerCase();
  const authUser = await ensureAuthUser(
    usersByEmail,
    `${username}@clients.snapfolio.local`,
    "client",
    row.client_name,
  );
  const { data, error } = await supabase
    .from("photography_clients")
    .upsert(
      {
        auth_user_id: authUser.id,
        photographer_id: photographerByLegacyId.get(Number(row.photographer_id)),
        username,
        client_name: row.client_name,
        email: row.email?.toLowerCase() || null,
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      { onConflict: "username" },
    )
    .select("id")
    .single();
  if (error) throw error;
  clientByLegacyId.set(Number(row.id), data.id);
}

for (const row of subscriptions) {
  const transactionId = row.transaction_id || `LEGACY-SUBSCRIPTION-${row.id}`;
  const { error } = await supabase.from("subscriptions").upsert(
    {
      photographer_id: photographerByLegacyId.get(Number(row.photographer_id)),
      pricing_plan_id: planByLegacyId.get(Number(row.pricing_plan_id)),
      payment_method: row.payment_method,
      amount: Number(row.amount),
      status: row.status,
      transaction_id: transactionId,
      renewal_date: row.renewal_date,
      metadata: {
        legacy_id: Number(row.id),
        phone_number: row.phone_number,
        original_transaction_id: row.transaction_id,
      },
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    { onConflict: "transaction_id" },
  );
  if (error) throw error;
}

let uploadedPhotos = 0;
for (const row of photos) {
  const clientId = clientByLegacyId.get(Number(row.client_id));
  const client = clients.find((item) => Number(item.id) === Number(row.client_id));
  const photographerId = photographerByLegacyId.get(
    Number(client.photographer_id),
  );
  const storagePath = `${photographerId}/${clientId}/legacy/${row.filename}`;
  const sourcePath = path.join(legacyRoot, "uploads", "clients", row.filename);
  const [buffer, fileInfo] = await Promise.all([
    readFile(sourcePath),
    stat(sourcePath),
  ]);

  const { error: uploadError } = await supabase.storage
    .from("client-photos")
    .upload(storagePath, buffer, {
      contentType: imageContentType(row.filename),
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { error: photoError } = await supabase.from("client_photos").upsert(
    {
      client_id: clientId,
      storage_path: storagePath,
      display_name: row.display_name,
      file_size: fileInfo.size,
      uploaded_at: row.uploaded_at,
    },
    { onConflict: "storage_path" },
  );
  if (photoError) throw photoError;
  uploadedPhotos += 1;
}

console.log(`Migrated photographers: ${photographers.length}`);
console.log(`Migrated clients: ${clients.length}`);
console.log(`Migrated subscriptions: ${subscriptions.length}`);
console.log(`Migrated private photos: ${uploadedPhotos}`);
console.log("Legacy passwords were not migrated; reset each account before use.");
