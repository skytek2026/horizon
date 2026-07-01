-- ============================================================
--  Skytek Image Caption Studio — Supabase setup
--  Run this ONCE in your Supabase project:
--    Dashboard → SQL Editor → New query → paste all → Run.
--  Safe to re-run (everything is IF NOT EXISTS / idempotent).
-- ============================================================

-- ---------- TABLES ----------

create table if not exists public.projects (
  id          text primary key,
  name        text        not null default 'Untitled Project',
  description text        default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.images (
  id           text        primary key,
  project_id   text        not null references public.projects(id) on delete cascade,
  filename     text        default 'image',
  w            integer     default 0,
  h            integer     default 0,
  objects      jsonb       not null default '[]'::jsonb,
  storage_path text,
  sort_index   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists images_project_idx on public.images (project_id);
create index if not exists images_sort_idx    on public.images (project_id, sort_index);

create table if not exists public.brand_assets (
  id           text        primary key,
  name         text        default 'Asset',
  w            integer     default 0,
  h            integer     default 0,
  storage_path text,
  created_at   timestamptz not null default now()
);

-- ---------- ROW-LEVEL SECURITY ----------
-- This app uses a single shared login (client-side), so every request
-- arrives as the anonymous role using the publishable key. These policies
-- give that role full access to the shared project pool.
-- NOTE: anyone with the publishable key + app URL can read/write this data.
-- That is expected for a shared internal tool; do not store secrets here.

alter table public.projects     enable row level security;
alter table public.images       enable row level security;
alter table public.brand_assets enable row level security;

drop policy if exists "shared access projects"     on public.projects;
drop policy if exists "shared access images"        on public.images;
drop policy if exists "shared access brand_assets"  on public.brand_assets;

create policy "shared access projects"    on public.projects
  for all to anon, authenticated using (true) with check (true);
create policy "shared access images"       on public.images
  for all to anon, authenticated using (true) with check (true);
create policy "shared access brand_assets" on public.brand_assets
  for all to anon, authenticated using (true) with check (true);

-- ---------- STORAGE (private bucket for image files) ----------

insert into storage.buckets (id, name, public)
values ('caption-images', 'caption-images', false)
on conflict (id) do nothing;

drop policy if exists "shared read caption-images"   on storage.objects;
drop policy if exists "shared insert caption-images" on storage.objects;
drop policy if exists "shared update caption-images" on storage.objects;
drop policy if exists "shared delete caption-images" on storage.objects;

create policy "shared read caption-images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'caption-images');
create policy "shared insert caption-images" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'caption-images');
create policy "shared update caption-images" on storage.objects
  for update to anon, authenticated using (bucket_id = 'caption-images') with check (bucket_id = 'caption-images');
create policy "shared delete caption-images" on storage.objects
  for delete to anon, authenticated using (bucket_id = 'caption-images');

-- Done. Reload the app; it will connect and seed two demo projects on first run.
