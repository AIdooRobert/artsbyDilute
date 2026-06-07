create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'photographer', 'client');
create type public.subscription_status as enum ('pending', 'active', 'failed', 'cancelled', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'photographer',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price_min numeric(10,2) not null default 0,
  price_max numeric(10,2) not null default 0,
  currency text not null default 'GHS',
  billing_period text not null default 'month',
  features jsonb not null default '[]'::jsonb,
  max_galleries integer not null default 5,
  max_storage_gb integer not null default 2,
  priority_support boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photographers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  username text unique not null,
  photographer_name text not null,
  email text unique not null,
  business_name text,
  company_name text,
  company_logo_url text,
  pricing_plan_id uuid references public.pricing_plans(id) on delete set null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photography_clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  photographer_id uuid not null references public.photographers(id) on delete cascade,
  username text unique not null,
  client_name text not null,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.photography_clients(id) on delete cascade,
  storage_path text unique not null,
  display_name text,
  file_size bigint not null default 0,
  uploaded_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.photographers(id) on delete cascade,
  pricing_plan_id uuid not null references public.pricing_plans(id) on delete restrict,
  payment_method text default 'paystack',
  amount numeric(10,2) not null,
  status public.subscription_status not null default 'pending',
  transaction_id text unique,
  renewal_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  images jsonb not null default '[]'::jsonb,
  category text,
  link text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  features jsonb not null default '[]'::jsonb,
  duration text,
  project_manager text,
  support_contact text,
  icon text,
  image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value text,
  updated_at timestamptz not null default now()
);

create table public.product_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value text,
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read_status boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profession text,
  bio text,
  image_url text,
  email text,
  phone text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  skill_name text not null,
  proficiency integer not null default 50 check (proficiency between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.resume_items (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  subtitle text,
  company text,
  description text,
  year_from text,
  year_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_position text,
  client_image_url text,
  testimonial_text text not null,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'client',
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.photographers enable row level security;
alter table public.photography_clients enable row level security;
alter table public.client_photos enable row level security;
alter table public.subscriptions enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.services enable row level security;
alter table public.site_settings enable row level security;
alter table public.product_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.team_members enable row level security;
alter table public.skills enable row level security;
alter table public.resume_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.admin_activity_logs enable row level security;

create policy "Public plans" on public.pricing_plans for select using (is_active or public.current_role() = 'admin');
create policy "Public portfolio" on public.portfolio_items for select using (true);
create policy "Public services" on public.services for select using (true);
create policy "Public settings" on public.site_settings for select using (true);
create policy "Public product settings" on public.product_settings for select using (true);
create policy "Public team" on public.team_members for select using (true);
create policy "Public skills" on public.skills for select using (true);
create policy "Public resume" on public.resume_items for select using (true);
create policy "Public testimonials" on public.testimonials for select using (true);
create policy "Anyone can contact" on public.contact_messages for insert with check (true);

create policy "Profiles self read" on public.profiles for select using (id = auth.uid() or public.current_role() = 'admin');
create policy "Admin profiles" on public.profiles for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "Photographers own record" on public.photographers for select using (auth_user_id = auth.uid() or public.current_role() = 'admin');
create policy "Photographers own update" on public.photographers for update using (auth_user_id = auth.uid() or public.current_role() = 'admin');
create policy "Admin photographers" on public.photographers for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "Photographers manage clients" on public.photography_clients for all
using (
  public.current_role() = 'admin'
  or auth_user_id = auth.uid()
  or photographer_id in (select id from public.photographers where auth_user_id = auth.uid())
)
with check (
  public.current_role() = 'admin'
  or photographer_id in (select id from public.photographers where auth_user_id = auth.uid())
);

create policy "Gallery access" on public.client_photos for select
using (
  public.current_role() = 'admin'
  or client_id in (select id from public.photography_clients where auth_user_id = auth.uid())
  or client_id in (
    select pc.id from public.photography_clients pc
    join public.photographers p on p.id = pc.photographer_id
    where p.auth_user_id = auth.uid()
  )
);

create policy "Photographers manage photos" on public.client_photos for all
using (
  public.current_role() = 'admin'
  or client_id in (
    select pc.id from public.photography_clients pc
    join public.photographers p on p.id = pc.photographer_id
    where p.auth_user_id = auth.uid()
  )
)
with check (
  public.current_role() = 'admin'
  or client_id in (
    select pc.id from public.photography_clients pc
    join public.photographers p on p.id = pc.photographer_id
    where p.auth_user_id = auth.uid()
  )
);

create policy "Photographer subscriptions" on public.subscriptions for select
using (
  public.current_role() = 'admin'
  or photographer_id in (select id from public.photographers where auth_user_id = auth.uid())
);

create policy "Admin all plans" on public.pricing_plans for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all portfolio" on public.portfolio_items for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all services" on public.services for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all settings" on public.site_settings for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all product settings" on public.product_settings for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all messages" on public.contact_messages for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all team" on public.team_members for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all skills" on public.skills for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all resume" on public.resume_items for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin all testimonials" on public.testimonials for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin subscriptions" on public.subscriptions for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "Admin logs" on public.admin_activity_logs for select using (public.current_role() = 'admin');

insert into storage.buckets (id, name, public)
values
  ('public-media', 'public-media', true),
  ('client-photos', 'client-photos', false)
on conflict (id) do nothing;

create policy "Public media read" on storage.objects for select using (bucket_id = 'public-media');
create policy "Admin public media" on storage.objects for all
using (bucket_id = 'public-media' and public.current_role() = 'admin')
with check (bucket_id = 'public-media' and public.current_role() = 'admin');

create policy "Client photo object access" on storage.objects for select
using (
  bucket_id = 'client-photos'
  and (
    public.current_role() = 'admin'
    or exists (
      select 1
      from public.client_photos cp
      join public.photography_clients pc on pc.id = cp.client_id
      left join public.photographers p on p.id = pc.photographer_id
      where cp.storage_path = name
        and (pc.auth_user_id = auth.uid() or p.auth_user_id = auth.uid())
    )
  )
);

create policy "Photographer photo object writes" on storage.objects for all
using (
  bucket_id = 'client-photos'
  and (
    public.current_role() = 'admin'
    or exists (
      select 1 from public.photographers p
      where p.auth_user_id = auth.uid()
        and name like p.id::text || '/%'
    )
  )
)
with check (
  bucket_id = 'client-photos'
  and (
    public.current_role() = 'admin'
    or exists (
      select 1 from public.photographers p
      where p.auth_user_id = auth.uid()
        and name like p.id::text || '/%'
    )
  )
);
