import type {
  PortfolioItem,
  PricingPlan,
  ResumeItem,
  ServiceItem,
  SkillItem,
  TestimonialItem,
} from "@/lib/types";

export const demoSettings: Record<string, string> = {
  site_title: "@rtbyDilute",
  author_name: "Robert Aidoo",
  author_profession: "Web Developer, Graphic Designer and Photographer",
  site_description:
    "This portfolio showcases my work as a web developer, graphic designer, and photographer, combining creativity, technical skill, and attention to detail.",
  hero_typed_items: "UI/UX Designer, Web Developer, Brand Strategist, Creative Director",
  hero_image_url: "/legacy/profile/hero.jpeg",
  about_image_url: "/legacy/profile/about.jpeg",
  resume_image_url: "/legacy/profile/resume.jpeg",
  about_title: "Passionate About Creating Digital Experiences",
  about_description_1:
    "I am a multidisciplinary creative professional specializing in web development, graphic design, and photography. I build responsive and user-friendly websites, design visually compelling graphics, and capture images that communicate ideas and stories effectively.",
  about_description_2:
    "With a strong passion for design and innovation, I focus on creating work that is clean, modern, and impactful. Every project receives attention to detail, creativity, and a commitment to high-quality results.",
  author_email: "robertaidoo62@gmail.com",
  author_phone: "+233 55 323 0881",
  location: "Accra, Ghana",
  social_facebook: "https://facebook.com/artsbyDilute",
  social_instagram: "https://instagram.com/artsbyDilute",
  social_linkedin: "https://linkedin.com/in/Robert Aidoo",
  social_twitter: "https://twitter.com/RobertDghdswai",
  social_whatsapp: "https://wa.me/233553230881",
  about_stat_1_value: "150+",
  about_stat_1_label: "Projects delivered",
  about_stat_2_value: "5+",
  about_stat_2_label: "Years experience",
  about_stat_3_value: "98%",
  about_stat_3_label: "Client referrals",
};

export const demoPortfolio: PortfolioItem[] = [
  {
    id: "1",
    title: "Matriculation - Regent University College",
    description:
      "Photographs taken at Regent University College of Science and Technology during matriculation.",
    image_url: "/legacy/portfolio/matriculation-1.png",
    category: "Photography",
    link: null,
    featured: true,
    created_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "2",
    title: "Picture of Emmy",
    description:
      "Taken during the matriculation ceremony at Regent University College of Science and Technology.",
    image_url: "/legacy/portfolio/matriculation-2.jpg",
    category: "Photography",
    link: null,
    featured: true,
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "3",
    title: "Matriculation",
    description:
      "A shoot at Regent University College of Science and Technology during the 2026 matriculation celebration.",
    image_url: "/legacy/portfolio/matriculation-3.png",
    category: "Photography",
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
      "End-to-end web development focused on responsive, high-performance, and user-friendly websites, from concept through deployment.",
    features: [
      "Responsive and mobile-friendly design",
      "Custom HTML, CSS, JavaScript, and PHP development",
      "MySQL database integration",
      "Performance optimization",
    ],
    duration: "1-4 weeks",
    project_manager: "Dedicated support throughout",
    support_contact: "+233 55 323 0881",
    image_url: "/legacy/services/web-development.jpg",
    featured: true,
  },
  {
    id: "2",
    title: "Graphic Design",
    description:
      "Compelling visual design that communicates your brand message with consistency, creativity, and precision.",
    features: [
      "Logo and brand identity design",
      "Flyers, posters, and social graphics",
      "Print-ready and digital formats",
      "Modern design concepts",
    ],
    duration: "2-7 days",
    project_manager: "Direct feedback and revisions",
    support_contact: "+233 55 323 0881",
    image_url: "/legacy/services/graphic-design.jpg",
    featured: true,
  },
  {
    id: "3",
    title: "Photography",
    description:
      "Professional photography with strong composition, lighting, visual storytelling, and carefully finished post-production.",
    features: [
      "Portrait and event photography",
      "Professional editing and retouching",
      "High-resolution delivery",
      "Creative direction and styling",
    ],
    duration: "1 day shoot plus 2-5 days editing",
    project_manager: "Guided planning from shoot to delivery",
    support_contact: "+233 55 323 0881",
    image_url: "/legacy/services/photography.jpg",
    featured: true,
  },
  {
    id: "4",
    title: "Branding and Digital Content",
    description:
      "Strategic brand identity and content creation that builds a consistent visual presence across platforms.",
    features: [
      "Complete brand identity packages",
      "Social media content design",
      "Content strategy and visual consistency",
      "Marketing-focused creative solutions",
    ],
    duration: "1-3 weeks",
    project_manager: "Continuous collaboration and updates",
    support_contact: "+233 55 323 0881",
    image_url: "/legacy/services/branding.jpg",
    featured: true,
  },
];

export const demoSkills: SkillItem[] = [
  { id: "1", category: "Web Development", skill_name: "HTML5, CSS3, Bootstrap, JavaScript, PHP", proficiency: 90 },
  { id: "2", category: "Frontend Development", skill_name: "Responsive Web Design and UI Implementation", proficiency: 75 },
  { id: "3", category: "Graphic Design", skill_name: "Photoshop, Illustrator, Logo Design and Branding", proficiency: 70 },
  { id: "4", category: "Photography", skill_name: "Portraits, Events, Editing and Lighting", proficiency: 75 },
  { id: "5", category: "Other Skills", skill_name: "MySQL, Deployment and Content Creation", proficiency: 65 },
];

export const demoResume: ResumeItem[] = [
  {
    id: "1",
    type: "experience",
    title: "IT Technician and Web Administrator / TA",
    subtitle: null,
    company: "Regent University College of Science and Technology",
    description: null,
    year_from: "2022",
    year_to: "2026",
  },
  {
    id: "3",
    type: "education",
    title: "Degree",
    subtitle: "BSc. Computer Science",
    company: "Regent University College of Science and Technology",
    description: null,
    year_from: "2017",
    year_to: "2020",
  },
  {
    id: "3",
    type: "certification",
    title: "Certificate",
    subtitle: "Tech Innovation Campus Series",
    company: "Tech Innovation",
    description: "Campus training in Information Technology.",
    year_from: "2019",
    year_to: "2019",
  },
];

export const demoTestimonials: TestimonialItem[] = [];

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
