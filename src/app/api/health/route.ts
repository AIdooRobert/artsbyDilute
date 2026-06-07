import { NextResponse } from "next/server";
import { getPaystackMode } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: false,
    paystack: getPaystackMode(),
  };

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("pricing_plans")
      .select("id", { head: true, count: "exact" });
    checks.database = !error;
  } catch {
    checks.database = false;
  }

  const healthy = checks.database && checks.paystack !== "unconfigured";
  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checks,
      checked_at: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
