import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function getCurrentUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentRole(): Promise<Role | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (data?.role as Role | undefined) ?? null;
}

export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${role === "client" ? "client" : role}/login`);

  const currentRole = await getCurrentRole();
  if (currentRole !== role) redirect("/");
  return user;
}
