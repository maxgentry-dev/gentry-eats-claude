-- ============================================
-- GENTRY EATS - Inline Editing Migration
-- ============================================
-- Run this in your Supabase SQL Editor to add
-- inline editing support for admin users.
-- ============================================

-- SITE CONTENT TABLE (key-value store for editable text)
create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.site_content enable row level security;

create policy "Site content is viewable by everyone"
  on public.site_content for select
  using (true);

create policy "Admins can insert site content"
  on public.site_content for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update site content"
  on public.site_content for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Auto-update timestamp
create or replace function public.update_site_content_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
  before update on public.site_content
  for each row execute procedure public.update_site_content_updated_at();
