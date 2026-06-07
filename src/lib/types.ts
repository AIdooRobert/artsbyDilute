export type Role = "admin" | "photographer" | "client";

export type PricingPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_min: number;
  price_max: number;
  currency: string;
  billing_period: string;
  features: string[];
  max_galleries: number;
  max_storage_gb: number;
  priority_support: boolean;
  is_active: boolean;
  sort_order: number;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  link: string | null;
  featured: boolean;
  created_at: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string | null;
  features: string[];
  duration: string | null;
  project_manager: string | null;
  support_contact: string | null;
  image_url: string | null;
  featured: boolean;
};

export type SkillItem = {
  id: string;
  category: string;
  skill_name: string;
  proficiency: number;
};

export type ResumeItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  company: string | null;
  description: string | null;
  year_from: string | null;
  year_to: string | null;
};

export type TestimonialItem = {
  id: string;
  client_name: string;
  client_position: string | null;
  client_image_url: string | null;
  testimonial_text: string;
  is_featured: boolean;
  display_order: number;
};

export type Photographer = {
  id: string;
  auth_user_id: string;
  username: string;
  photographer_name: string;
  email: string;
  business_name: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  pricing_plan_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type PhotographyClient = {
  id: string;
  auth_user_id: string | null;
  photographer_id: string;
  username: string;
  client_name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
};

export type ClientPhoto = {
  id: string;
  client_id: string;
  storage_path: string;
  display_name: string | null;
  file_size: number;
  uploaded_at: string;
  signed_url?: string;
};
