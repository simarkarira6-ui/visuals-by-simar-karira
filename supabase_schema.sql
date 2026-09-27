-- ==============================================================================
-- SIMAR GRAPHIC DESIGNER PORTFOLIO - SUPABASE DATABASE SCHEMA & POLICIES
-- Target Project: rnekifhfxmixmehiaodv (https://supabase.com/dashboard/project/rnekifhfxmixmehiaodv/sql)
-- 100% Idempotent: Can be safely run multiple times without errors.
-- ==============================================================================

-- 1. Enable UUID Extension (supports both gen_random_uuid and uuid_generate_v4)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. SITE SETTINGS TABLE
create table if not exists public.site_settings (
    id uuid primary key default gen_random_uuid(),
    site_title text not null default 'Simar — Graphic Designer & Creative Studio',
    meta_description text default 'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences.',
    hero_title text not null default 'SIMAR',
    hero_subtitle text not null default 'GRAPHIC DESIGNER',
    hero_intro text default 'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences.',
    accent_color text not null default '#ff5722', -- Retro Tangerine Sunset
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PROFILE & ABOUT TABLE
create table if not exists public.profile (
    id uuid primary key default gen_random_uuid(),
    full_name text not null default 'Simar',
    role_title text not null default 'Graphic Designer',
    about_text text default 'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences. Merging vintage printshop nostalgia with contemporary digital precision.',
    design_philosophy text default 'Typography, vibrant color, and generous space create lasting visual resonance. Every curve and grid line carries distinct artistic intent.',
    tools text default 'Figma, Adobe Illustrator, Adobe Photoshop, InDesign, After Effects, Risograph Printing',
    email text default '',
    instagram text default '',
    linkedin text default '',
    behance text default '',
    dribbble text default '',
    other_socials jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SKILLS & SERVICES TABLE
create table if not exists public.skills (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text default 'Core', -- 'Core', 'Print & Screen', 'Digital', 'Discipline', 'Craft'
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PROJECTS TABLE (NO dummy projects - populated only via Admin upload)
create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    category text not null,
    year text default extract(year from now())::text,
    client text default '',
    short_description text not null,
    full_description text default '',
    design_process text default '',
    cover_image_url text not null,
    tools_used text default '',
    external_link text default '',
    is_published boolean default true,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PROJECT GALLERY IMAGES TABLE
create table if not exists public.project_images (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references public.projects(id) on delete cascade not null,
    image_url text not null,
    caption text default '',
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SEED BASE CONFIGURATION (If not already present)
insert into public.site_settings (id, site_title, meta_description, hero_title, hero_subtitle, hero_intro, accent_color)
values (
    '00000000-0000-0000-0000-000000000001',
    'Simar — Graphic Designer & Creative Studio',
    'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences.',
    'SIMAR',
    'GRAPHIC DESIGNER',
    'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences.',
    '#ff5722'
)
on conflict (id) do update set
    accent_color = excluded.accent_color,
    site_title = excluded.site_title;

insert into public.profile (id, full_name, role_title, about_text, design_philosophy, tools, email)
values (
    '00000000-0000-0000-0000-000000000001',
    'Simar',
    'Graphic Designer',
    'Graphic designer focused on visual identity, posters, digital design, and creative visual experiences. Merging vintage printshop nostalgia with contemporary digital precision.',
    'Typography, vibrant color, and generous space create lasting visual resonance. Every curve and grid line carries distinct artistic intent.',
    'Figma, Adobe Illustrator, Adobe Photoshop, InDesign, After Effects, Risograph Printing',
    ''
)
on conflict (id) do nothing;

-- Seed default design skills if empty
insert into public.skills (name, category, display_order)
select 'Graphic Design', 'Core', 1
where not exists (select 1 from public.skills where name = 'Graphic Design');

insert into public.skills (name, category, display_order)
select 'Poster Design', 'Print & Screen', 2
where not exists (select 1 from public.skills where name = 'Poster Design');

insert into public.skills (name, category, display_order)
select 'Branding & Identity', 'Core', 3
where not exists (select 1 from public.skills where name = 'Branding & Identity');

insert into public.skills (name, category, display_order)
select 'Social Media Design', 'Digital', 4
where not exists (select 1 from public.skills where name = 'Social Media Design');

insert into public.skills (name, category, display_order)
select 'UI/UX Design', 'Digital', 5
where not exists (select 1 from public.skills where name = 'UI/UX Design');

insert into public.skills (name, category, display_order)
select 'Vintage Typography', 'Discipline', 6
where not exists (select 1 from public.skills where name = 'Vintage Typography');

insert into public.skills (name, category, display_order)
select 'Photo & Print Editing', 'Craft', 7
where not exists (select 1 from public.skills where name = 'Photo & Print Editing');

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.site_settings enable row level security;
alter table public.profile enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;

-- Drop existing policies first to allow safe re-running
drop policy if exists "Allow public read on site_settings" on public.site_settings;
drop policy if exists "Allow authenticated admin full access on site_settings" on public.site_settings;

drop policy if exists "Allow public read on profile" on public.profile;
drop policy if exists "Allow authenticated admin full access on profile" on public.profile;

drop policy if exists "Allow public read on skills" on public.skills;
drop policy if exists "Allow authenticated admin full access on skills" on public.skills;

drop policy if exists "Allow public read on published projects" on public.projects;
drop policy if exists "Allow authenticated admin full access on projects" on public.projects;

drop policy if exists "Allow public read on project_images" on public.project_images;
drop policy if exists "Allow authenticated admin full access on project_images" on public.project_images;

-- Public Read Policies (Public visitors can only view published content)
create policy "Allow public read on site_settings"
    on public.site_settings for select
    using (true);

create policy "Allow public read on profile"
    on public.profile for select
    using (true);

create policy "Allow public read on skills"
    on public.skills for select
    using (true);

create policy "Allow public read on published projects"
    on public.projects for select
    using (is_published = true or auth.role() = 'authenticated');

create policy "Allow public read on project_images"
    on public.project_images for select
    using (true);

-- Authenticated Admin Policies (Only authenticated admin can insert, update, delete)
create policy "Allow authenticated admin full access on site_settings"
    on public.site_settings for all
    to authenticated
    using (true)
    with check (true);

create policy "Allow authenticated admin full access on profile"
    on public.profile for all
    to authenticated
    using (true)
    with check (true);

create policy "Allow authenticated admin full access on skills"
    on public.skills for all
    to authenticated
    using (true)
    with check (true);

create policy "Allow authenticated admin full access on projects"
    on public.projects for all
    to authenticated
    using (true)
    with check (true);

create policy "Allow authenticated admin full access on project_images"
    on public.project_images for all
    to authenticated
    using (true)
    with check (true);

-- 9. STORAGE BUCKET FOR PORTFOLIO IMAGES
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'portfolio-images',
    'portfolio-images',
    true,
    52428800, -- 50MB max file size
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set public = true;

-- Storage Policies
drop policy if exists "Allow public viewing of portfolio images" on storage.objects;
drop policy if exists "Allow authenticated upload of portfolio images" on storage.objects;
drop policy if exists "Allow authenticated update and delete of portfolio images" on storage.objects;

create policy "Allow public viewing of portfolio images"
    on storage.objects for select
    using (bucket_id = 'portfolio-images');

create policy "Allow authenticated upload of portfolio images"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'portfolio-images');

create policy "Allow authenticated update and delete of portfolio images"
    on storage.objects for all
    to authenticated
    using (bucket_id = 'portfolio-images')
    with check (bucket_id = 'portfolio-images');
