import type {
  PortfolioItem,
  PricingPlan,
  ResumeItem,
  ServiceItem,
  SkillItem,
  TestimonialItem,
} from "@/lib/types";

export const demoSettings: Record<string, string> = {
  site_title: "@rtsbyDilute",
  author_name: "Arts by Dilute",
  author_profession: "Software Developer and Creative Technologist",
  site_description:
    "Creating exceptional digital experiences that blend thoughtful design, reliable software, and practical business value.",
  hero_typed_items: "Web Development, Software Engineering, UI/UX Design, Digital Strategy",
  about_title: "I turn ideas into useful digital products",
  about_description_1:
    "I design and build digital experiences for people and businesses, combining clean interfaces with dependable engineering.",
  about_description_2:
    "My work spans websites, custom software, product design, and the systems that help teams work more effectively.",
  author_email: "hello@snapfolio.example",
  author_phone: "+233 20 000 0000",
  location: "Accra, Ghana",
  social_instagram: "https://instagram.com",
  about_stat_1_value: "150+",
  about_stat_1_label: "Projects delivered",
  about_stat_2_value: "5+",
  about_stat_2_label: "Years building",
  about_stat_3_value: "98%",
  about_stat_3_label: "Client referrals",
};

export const demoPortfolio: PortfolioItem[] = [
  {
    id: "1",
    title: "Golden Hour Stories",
    description: "Warm, cinematic portraits shaped by natural light.",
    image_url: "/images/portfolio-1.webp",
    category: "Portrait",
    link: null,
    featured: true,
    created_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "2",
    title: "A Quiet Celebration",
    description: "An intimate wedding story with honest, unhurried frames.",
    image_url: "/images/portfolio-2.webp",
    category: "Wedding",
    link: null,
    featured: true,
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "3",
    title: "Built for the City",
    description: "A bold commercial series for a modern lifestyle brand.",
    image_url: "/images/portfolio-3.webp",
    category: "Commercial",
    link: null,
    featured: false,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const demoServices: ServiceItem[] = [
  {
    id: "1",
    title: "Website Development",
    description:
      "Responsive, fast, and maintainable websites tailored to your goals.",
    features: ["Product planning", "Responsive implementation", "Launch support"],
    duration: "2-8 weeks",
    project_manager: "Lead developer",
    support_contact: "hello@snapfolio.example",
    image_url: "/images/service-1.webp",
    featured: true,
  },
  {
    id: "2",
    title: "Custom Software",
    description:
      "Purpose-built systems that replace repetitive work and disconnected tools.",
    features: ["Workflow analysis", "Secure application", "Training and support"],
    duration: "Project based",
    project_manager: "Software engineer",
    support_contact: "hello@snapfolio.example",
    image_url: "/images/service-2.webp",
    featured: true,
  },
  {
    id: "3",
    title: "Digital Product Design",
    description:
      "Clear user experiences, interfaces, and prototypes for modern products.",
    features: ["UX research", "Interface design", "Interactive prototype"],
    duration: "1-6 weeks",
    project_manager: "Product designer",
    support_contact: "hello@snapfolio.example",
    image_url: "/images/service-3.webp",
    featured: true,
  },
];

export const demoSkills: SkillItem[] = [
  { id: "1", category: "Engineering", skill_name: "React and TypeScript", proficiency: 92 },
  { id: "2", category: "Engineering", skill_name: "Node.js and APIs", proficiency: 88 },
  { id: "3", category: "Design", skill_name: "UI/UX Design", proficiency: 86 },
  { id: "4", category: "Design", skill_name: "Prototyping", proficiency: 82 },
  { id: "5", category: "Business", skill_name: "Product Strategy", proficiency: 80 },
  { id: "6", category: "Business", skill_name: "Digital Transformation", proficiency: 78 },
];

export const demoResume: ResumeItem[] = [
  {
    id: "1",
    type: "experience",
    title: "Software Developer",
    subtitle: "Product engineering",
    company: "Independent",
    description: "Building websites, internal systems, and customer-facing software.",
    year_from: "2021",
    year_to: "Present",
  },
  {
    id: "2",
    type: "experience",
    title: "Digital Designer",
    subtitle: "UI/UX and brand systems",
    company: "Creative practice",
    description: "Designing accessible interfaces and digital identities.",
    year_from: "2019",
    year_to: "Present",
  },
  {
    id: "3",
    type: "education",
    title: "Computer Science",
    subtitle: "Software and information systems",
    company: "Professional studies",
    description: "Foundations in programming, databases, networks, and systems design.",
    year_from: "2018",
    year_to: "2022",
  },
];

export const demoTestimonials: TestimonialItem[] = [
  {
    id: "1",
    client_name: "Ama K.",
    client_position: "Business owner",
    client_image_url: null,
    testimonial_text:
      "The process was clear, the final product was polished, and the system immediately made our work easier.",
    is_featured: true,
    display_order: 1,
  },
  {
    id: "2",
    client_name: "Michael A.",
    client_position: "Project lead",
    client_image_url: null,
    testimonial_text:
      "A rare combination of creative judgment and practical engineering. Everything was delivered with care.",
    is_featured: true,
    display_order: 2,
  },
];

export const demoProductSettings: Record<string, string> = {
  product_name: "SnapFolio",
  product_tagline: "Beautiful client delivery for modern photographers.",
  product_description:
    "Run private galleries, organize client delivery, apply your studio branding, and grow with flexible storage and gallery limits.",
  product_support_email: "support@snapfolio.example",
};

export const demoPlans: PricingPlan[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Basic",
    slug: "basic",
    description: "For photographers starting with private client delivery.",
    price_min: 50,
    price_max: 50,
    currency: "GHS",
    billing_period: "month",
    features: ["Private galleries", "Client downloads", "Email support"],
    max_galleries: 5,
    max_storage_gb: 2,
    priority_support: false,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Studio",
    slug: "studio",
    description: "More galleries, storage, and your own client-facing branding.",
    price_min: 120,
    price_max: 120,
    currency: "GHS",
    billing_period: "month",
    features: ["Custom branding", "25 galleries", "Priority support"],
    max_galleries: 25,
    max_storage_gb: 20,
    priority_support: true,
    is_active: true,
    sort_order: 2,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Agency",
    slug: "agency",
    description: "High-volume delivery for established teams and studios.",
    price_min: 250,
    price_max: 250,
    currency: "GHS",
    billing_period: "month",
    features: ["Unlimited galleries", "100 GB storage", "Priority onboarding"],
    max_galleries: 999,
    max_storage_gb: 100,
    priority_support: true,
    is_active: true,
    sort_order: 3,
  },
];
