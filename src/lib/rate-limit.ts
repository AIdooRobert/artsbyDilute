import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

type RateLimitRule = {
  limit: number;
  windowSeconds: number;
};

function hashBucket(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function requestFingerprint() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";
  return hashBucket(`${ip}|${userAgent}`);
}

async function consumeBucket(
  bucketKey: string,
  { limit, windowSeconds }: RateLimitRule,
) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_bucket_key: bucketKey,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("Rate limit check failed:", error.message);
    return true;
  }

  return data === true;
}

export async function checkRateLimit(
  scope: string,
  rule: RateLimitRule,
  identity?: string,
) {
  const fingerprint = await requestFingerprint();
  const buckets = [
    `${scope}:request:${fingerprint}`,
    identity
      ? `${scope}:identity:${hashBucket(identity.trim().toLowerCase())}`
      : null,
  ].filter((value): value is string => Boolean(value));

  const results = await Promise.all(
    buckets.map((bucket) => consumeBucket(bucket, rule)),
  );
  return results.every(Boolean);
}
