export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "list" | "file";
  required?: boolean;
  imageColumn?: string;
};

export type AdminSection = {
  table: string;
  title: string;
  description: string;
  fields: AdminField[];
  display: string[];
};

export const adminSections: Record<string, AdminSection> = {
  portfolio: {
    table: "portfolio_items",
    title: "Portfolio",
    description: "Publish and organize the work shown on the public site.",
    display: ["title", "category", "featured", "created_at"],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "category", label: "Category" },
      { name: "link", label: "External link" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "image", label: "Cover image", type: "file", imageColumn: "image_url" },
    ],
  },
  services: {
    table: "services",
    title: "Services",
    description: "Manage photography services and their public detail pages.",
    display: ["title", "duration", "featured", "created_at"],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "features", label: "Features (one per line)", type: "list" },
      { name: "duration", label: "Duration" },
      { name: "project_manager", label: "Project manager" },
      { name: "support_contact", label: "Support contact" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "image", label: "Service image", type: "file", imageColumn: "image_url" },
    ],
  },
  team: {
    table: "team_members",
    title: "Team",
    description: "Maintain public team profiles.",
    display: ["name", "profession", "email", "created_at"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "profession", label: "Profession" },
      { name: "bio", label: "Biography", type: "textarea" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "location", label: "Location" },
      { name: "image", label: "Portrait", type: "file", imageColumn: "image_url" },
    ],
  },
  skills: {
    table: "skills",
    title: "Skills",
    description: "Organize skills by category and proficiency.",
    display: ["skill_name", "category", "proficiency", "created_at"],
    fields: [
      { name: "category", label: "Category", required: true },
      { name: "skill_name", label: "Skill", required: true },
      { name: "proficiency", label: "Proficiency", type: "number", required: true },
    ],
  },
  resume: {
    table: "resume_items",
    title: "Resume",
    description: "Edit experience and education timeline entries.",
    display: ["title", "type", "company", "year_from"],
    fields: [
      { name: "type", label: "Type", required: true },
      { name: "title", label: "Title", required: true },
      { name: "subtitle", label: "Subtitle" },
      { name: "company", label: "Company or institution" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "year_from", label: "From" },
      { name: "year_to", label: "To" },
    ],
  },
  testimonials: {
    table: "testimonials",
    title: "Testimonials",
    description: "Curate client feedback and ordering.",
    display: ["client_name", "client_position", "is_featured", "display_order"],
    fields: [
      { name: "client_name", label: "Client name", required: true },
      { name: "client_position", label: "Client position" },
      { name: "testimonial_text", label: "Testimonial", type: "textarea", required: true },
      { name: "is_featured", label: "Featured", type: "checkbox" },
      { name: "display_order", label: "Display order", type: "number" },
      {
        name: "image",
        label: "Client image",
        type: "file",
        imageColumn: "client_image_url",
      },
    ],
  },
  pricing: {
    table: "pricing_plans",
    title: "Pricing plans",
    description: "Control limits, pricing, and features offered to photographers.",
    display: ["name", "price_min", "max_galleries", "max_storage_gb", "is_active"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "price_min", label: "Monthly price", type: "number", required: true },
      { name: "currency", label: "Currency", required: true },
      { name: "billing_period", label: "Billing period", required: true },
      { name: "features", label: "Features (one per line)", type: "list" },
      { name: "max_galleries", label: "Gallery limit", type: "number", required: true },
      { name: "max_storage_gb", label: "Storage limit (GB)", type: "number", required: true },
      { name: "priority_support", label: "Priority support", type: "checkbox" },
      { name: "is_active", label: "Active", type: "checkbox" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
};
