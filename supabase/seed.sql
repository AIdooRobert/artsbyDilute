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
  ('site_title', '@rtsbyDilute'),
  ('author_name', 'Arts by Dilute'),
  ('author_profession', 'Software Developer and Creative Technologist'),
  ('site_description', 'Creating exceptional digital experiences that blend thoughtful design, reliable software, and practical business value.'),
  ('hero_typed_items', 'Web Development, Software Engineering, UI/UX Design, Digital Strategy'),
  ('about_title', 'I turn ideas into useful digital products'),
  ('about_description_1', 'I design and build digital experiences for people and businesses, combining clean interfaces with dependable engineering.'),
  ('about_description_2', 'My work spans websites, custom software, product design, and the systems that help teams work more effectively.'),
  ('author_email', 'hello@snapfolio.example'),
  ('author_phone', '+233 20 000 0000'),
  ('location', 'Accra, Ghana')
on conflict (setting_key) do nothing;

insert into public.product_settings (setting_key, setting_value)
values
  ('product_name', 'SnapFolio'),
  ('product_tagline', 'Beautiful client delivery for modern photographers.'),
  ('product_description', 'Run private galleries, organize client delivery, apply your studio branding, and grow with flexible storage and gallery limits.'),
  ('product_support_email', 'support@snapfolio.example')
on conflict (setting_key) do nothing;
