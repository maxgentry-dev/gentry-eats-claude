-- ============================================
-- GENTRY EATS - Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- ============================================

-- 1. PROFILES TABLE
-- Automatically created when a user signs up
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. RECIPES TABLE
create table if not exists public.recipes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  slug text unique not null,
  description text not null,
  story text,
  ingredients text[] default '{}',
  instructions text[] default '{}',
  prep_time text,
  cook_time text,
  servings text,
  category text not null default 'Dinner',
  tags text[] default '{}',
  image_url text,
  featured boolean default false,
  published boolean default false,
  author_id uuid references public.profiles(id) on delete set null
);

alter table public.recipes enable row level security;

create policy "Published recipes are viewable by everyone"
  on public.recipes for select
  using (published = true or auth.uid() = author_id);

create policy "Admins can insert recipes"
  on public.recipes for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update recipes"
  on public.recipes for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete recipes"
  on public.recipes for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 3. SAVED RECIPES TABLE
create table if not exists public.saved_recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, recipe_id)
);

alter table public.saved_recipes enable row level security;

create policy "Users can view their own saved recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can save recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);

-- 4. INSTAGRAM POSTS TABLE (for footer grid)
create table if not exists public.instagram_posts (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  caption text,
  link text,
  sort_order integer default 0
);

alter table public.instagram_posts enable row level security;

create policy "Instagram posts are viewable by everyone"
  on public.instagram_posts for select
  using (true);

create policy "Admins can manage instagram posts"
  on public.instagram_posts for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 5. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. AUTO-UPDATE updated_at ON RECIPES
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists recipes_updated_at on public.recipes;
create trigger recipes_updated_at
  before update on public.recipes
  for each row execute procedure public.update_updated_at();

-- ============================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================
-- Go to Storage in your Supabase dashboard and:
-- 1. Create a new bucket called "images"
-- 2. Make it PUBLIC
-- 3. Add this policy in the bucket's policies:
--    - Allow authenticated users to upload (INSERT)
--    - Allow public access to read (SELECT)
--
-- Or run these (may need to be done from the dashboard):
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Anyone can view images"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Admins can delete images"
  on storage.objects for delete
  using (bucket_id = 'images' and auth.role() = 'authenticated');

-- ============================================
-- MAKE YOURSELF AN ADMIN
-- ============================================
-- After you sign in for the first time with Google,
-- run this query replacing with YOUR email:
--
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-email@gmail.com';
--
-- ============================================
