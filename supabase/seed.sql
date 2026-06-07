insert into public.pricing_plans
  (id, name, slug, description, price_min, price_max, currency, billing_period, features, max_galleries, max_storage_gb, priority_support, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'Basic', 'basic', 'For photographers starting with private client delivery.', 50, 50, 'GHS', 'month', '["Private galleries","Client downloads","Email support"]', 5, 2, false, 1),
  ('22222222-2222-2222-2222-222222222222', 'Studio', 'studio', 'More galleries, storage, and your own client-facing branding.', 120, 120, 'GHS', 'month', '["Custom branding","25 galleries","Priority support"]', 25, 20, true, 2),
  ('33333333-3333-3333-3333-333333333333', 'Agency', 'agency', 'High-volume delivery for established teams and studios.', 250, 250, 'GHS', 'month', '["Unlimited galleries","100 GB storage","Priority onboarding"]', 999, 100, true, 3)
on conflict (id) do update set
  name = excluded.name,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  features = excluded.features;

insert into public.site_settings (setting_key, setting_value)
values
  ('site_title', '@rtbyDilute'),
  ('author_name', 'Robert Aidoo'),
  ('author_profession', 'Web Developer, Graphic Designer and Photographer'),
  ('site_description', 'This portfolio showcases my work as a web developer, graphic designer, and photographer, combining creativity, technical skill, and attention to detail.'),
  ('hero_typed_items', 'UI/UX Designer, Web Developer, Brand Strategist, Creative Director'),
  ('hero_image_url', '/legacy/profile/hero.jpeg'),
  ('about_image_url', '/legacy/profile/about.jpeg'),
  ('resume_image_url', '/legacy/profile/resume.jpeg'),
  ('about_title', 'Passionate About Creating Digital Experiences'),
  ('about_description_1', 'I am a multidisciplinary creative professional specializing in web development, graphic design, and photography. I build responsive and user-friendly websites, design visually compelling graphics, and capture images that communicate ideas and stories effectively.'),
  ('about_description_2', 'With a strong passion for design and innovation, I focus on creating work that is clean, modern, and impactful. Every project receives attention to detail, creativity, and a commitment to high-quality results.'),
  ('author_email', 'robertaidoo62@gmail.com'),
  ('author_phone', '+233 55 323 0881'),
  ('location', 'Accra, Ghana'),
  ('social_facebook', 'https://facebook.com/artsbyDilute'),
  ('social_instagram', 'https://instagram.com/artsbyDilute'),
  ('social_linkedin', 'https://linkedin.com/in/Robert Aidoo'),
  ('social_twitter', 'https://twitter.com/RobertDghdswai'),
  ('social_whatsapp', 'https://wa.me/233553230881'),
  ('about_stat_1_value', '150+'),
  ('about_stat_1_label', 'Projects Completed'),
  ('about_stat_2_value', '5+'),
  ('about_stat_2_label', 'Years Experience'),
  ('about_stat_3_value', '98%'),
  ('about_stat_3_label', 'Client Satisfaction')
on conflict (setting_key) do update set setting_value = excluded.setting_value;

insert into public.product_settings (setting_key, setting_value)
values
  ('product_name', 'SnapFolio'),
  ('product_tagline', 'Beautiful client delivery for modern photographers.'),
  ('product_description', 'Run private galleries, organize client delivery, apply your studio branding, and grow with flexible storage and gallery limits.'),
  ('product_support_email', 'support@snapfolio.example')
on conflict (setting_key) do nothing;

insert into public.portfolio_items
  (id, title, description, image_url, category, featured)
values
  ('41111111-1111-1111-1111-111111111111', 'Matriculation - Regent University College', 'Photographs taken at Regent University College of Science and Technology during matriculation.', '/legacy/portfolio/matriculation-1.png', 'Photography', true),
  ('42222222-2222-2222-2222-222222222222', 'Picture of Emmy', 'Taken during the matriculation ceremony at Regent University College of Science and Technology.', '/legacy/portfolio/matriculation-2.jpg', 'Photography', true),
  ('43333333-3333-3333-3333-333333333333', 'Matriculation', 'A shoot at Regent University College of Science and Technology during the 2026 matriculation celebration.', '/legacy/portfolio/matriculation-3.png', 'Photography', true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  image_url = excluded.image_url,
  category = excluded.category,
  featured = excluded.featured;

insert into public.services
  (id, title, description, features, duration, project_manager, support_contact, image_url, featured)
values
  ('51111111-1111-1111-1111-111111111111', 'Web Development', 'End-to-end web development focused on responsive, high-performance, and user-friendly websites, from concept through deployment.', '["Responsive and mobile-friendly design","Custom HTML, CSS, JavaScript, and PHP development","MySQL database integration","Performance optimization"]', '1-4 weeks', 'Dedicated support throughout', '+233 55 323 0881', '/legacy/services/web-development.jpg', true),
  ('52222222-2222-2222-2222-222222222222', 'Graphic Design', 'Compelling visual design that communicates your brand message with consistency, creativity, and precision.', '["Logo and brand identity design","Flyers, posters, and social graphics","Print-ready and digital formats","Modern design concepts"]', '2-7 days', 'Direct feedback and revisions', '+233 55 323 0881', '/legacy/services/graphic-design.jpg', true),
  ('53333333-3333-3333-3333-333333333333', 'Photography', 'Professional photography with strong composition, lighting, visual storytelling, and carefully finished post-production.', '["Portrait and event photography","Professional editing and retouching","High-resolution delivery","Creative direction and styling"]', '1 day shoot plus 2-5 days editing', 'Guided planning from shoot to delivery', '+233 55 323 0881', '/legacy/services/photography.jpg', true),
  ('54444444-4444-4444-4444-444444444444', 'Branding and Digital Content', 'Strategic brand identity and content creation that builds a consistent visual presence across platforms.', '["Complete brand identity packages","Social media content design","Content strategy and visual consistency","Marketing-focused creative solutions"]', '1-3 weeks', 'Continuous collaboration and updates', '+233 55 323 0881', '/legacy/services/branding.jpg', true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  features = excluded.features,
  duration = excluded.duration,
  project_manager = excluded.project_manager,
  support_contact = excluded.support_contact,
  image_url = excluded.image_url,
  featured = excluded.featured;

insert into public.skills (id, category, skill_name, proficiency)
values
  ('61111111-1111-1111-1111-111111111111', 'Web Development', 'HTML5, CSS3, Bootstrap, JavaScript, PHP', 90),
  ('62222222-2222-2222-2222-222222222222', 'Frontend Development', 'Responsive Web Design and UI Implementation', 75),
  ('63333333-3333-3333-3333-333333333333', 'Graphic Design', 'Photoshop, Illustrator, Logo Design and Branding', 70),
  ('64444444-4444-4444-4444-444444444444', 'Photography', 'Portraits, Events, Editing and Lighting', 75),
  ('65555555-5555-5555-5555-555555555555', 'Other Skills', 'MySQL, Deployment and Content Creation', 65)
on conflict (id) do update set
  category = excluded.category,
  skill_name = excluded.skill_name,
  proficiency = excluded.proficiency;

insert into public.resume_items
  (id, type, title, subtitle, company, description, year_from, year_to)
values
  ('71111111-1111-1111-1111-111111111111', 'experience', 'IT Technician and Web Administrator / TA', null, 'Regent University College of Science and Technology', null, '2022', '2026'),
  ('72222222-2222-2222-2222-222222222222', 'education', 'Degree', 'BSc. Computer Science', 'Regent University College of Science and Technology', null, '2017', '2020'),
  ('73333333-3333-3333-3333-333333333333', 'certification', 'Certificate', 'Tech Innovation Campus Series', 'Tech Innovation', 'Campus training in Information Technology.', '2019', '2019')
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  subtitle = excluded.subtitle,
  company = excluded.company,
  description = excluded.description,
  year_from = excluded.year_from,
  year_to = excluded.year_to;
