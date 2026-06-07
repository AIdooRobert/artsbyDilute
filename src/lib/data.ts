import {
  demoPlans,
  demoProductSettings,
  demoPortfolio,
  demoResume,
  demoServices,
  demoSettings,
  demoSkills,
  demoTestimonials,
} from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  PortfolioItem,
  PricingPlan,
  ResumeItem,
  ServiceItem,
  SkillItem,
  TestimonialItem,
} from "@/lib/types";

export async function getSiteSettings() {
  if (!hasSupabaseEnv()) return demoSettings;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("setting_key, setting_value");
  if (!data?.length) return demoSettings;
  return Object.fromEntries(data.map((item) => [item.setting_key, item.setting_value]));
}

export async function getPortfolio(limit?: number) {
  if (!hasSupabaseEnv()) return limit ? demoPortfolio.slice(0, limit) : demoPortfolio;
  const supabase = await createClient();
  let query = supabase
    .from("portfolio_items")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data as PortfolioItem[] | null) ?? [];
}

export async function getPortfolioItem(id: string) {
  if (!hasSupabaseEnv()) return demoPortfolio.find((item) => item.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("portfolio_items").select("*").eq("id", id).maybeSingle();
  return data as PortfolioItem | null;
}

export async function getServices(limit?: number) {
  if (!hasSupabaseEnv()) return limit ? demoServices.slice(0, limit) : demoServices;
  const supabase = await createClient();
  let query = supabase.from("services").select("*").order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data as ServiceItem[] | null) ?? [];
}

export async function getService(id: string) {
  if (!hasSupabaseEnv()) return demoServices.find((item) => item.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  return data as ServiceItem | null;
}

export async function getPricingPlans() {
  if (!hasSupabaseEnv()) return demoPlans;
  const supabase = await createClient();
  const { data } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as PricingPlan[] | null) ?? demoPlans;
}

export async function getSkills() {
  if (!hasSupabaseEnv()) return demoSkills;
  const supabase = await createClient();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .order("category")
    .order("skill_name");
  return (data as SkillItem[] | null) ?? [];
}

export async function getResumeItems() {
  if (!hasSupabaseEnv()) return demoResume;
  const supabase = await createClient();
  const { data } = await supabase
    .from("resume_items")
    .select("*")
    .order("year_from", { ascending: false });
  return (data as ResumeItem[] | null) ?? [];
}

export async function getTestimonials() {
  if (!hasSupabaseEnv()) return demoTestimonials;
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order")
    .order("created_at", { ascending: false });
  return (data as TestimonialItem[] | null) ?? [];
}

export async function getProductSettings() {
  if (!hasSupabaseEnv()) return demoProductSettings;
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_settings")
    .select("setting_key, setting_value");
  if (!data?.length) return demoProductSettings;
  return Object.fromEntries(data.map((item) => [item.setting_key, item.setting_value]));
}

export function formatCurrency(value: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
