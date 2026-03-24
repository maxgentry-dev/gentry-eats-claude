# Gentry Eats - Setup Guide

A recipe blog built with Next.js, Tailwind CSS, and Supabase.

---

## Quick Start (3 Steps)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** and give it a name (e.g., "gentry-eats")
3. Save the **database password** somewhere safe
4. Once created, go to **Settings > API** and copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon/public key** (a long `eyJ...` string)

### 2. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-setup.sql` and paste it in
4. Click **Run** — this creates all tables, policies, and triggers

### 3. Configure Authentication

1. In Supabase, go to **Authentication > Providers**
2. Enable **Google** provider:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or use existing)
   - Go to **APIs & Services > Credentials**
   - Create an **OAuth 2.0 Client ID** (Web application)
   - Add authorized redirect URI: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret** into Supabase Google provider settings
3. Enable **Email** provider if you also want email/password login

---

## Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this)
2. Go to [vercel.com](https://vercel.com) and import the GitHub repo
3. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Deploy**
5. After deployment, copy your Vercel URL (e.g., `https://gentry-eats.vercel.app`)
6. Go back to Supabase **Authentication > URL Configuration**:
   - Set **Site URL** to your Vercel URL
   - Add your Vercel URL to **Redirect URLs**: `https://gentry-eats.vercel.app/auth/callback`

---

## Make Yourself Admin

1. Visit your deployed site and sign in with Google
2. Go to Supabase **SQL Editor** and run:

```sql
UPDATE public.profiles SET is_admin = true WHERE email = 'your-email@gmail.com';
```

3. Refresh your site — you'll now see "Admin Dashboard" in the nav menu

---

## Adding New Recipes (No Code Required!)

Once you're logged in as admin:

1. Click your name in the top-right corner
2. Click **Admin Dashboard**
3. Click **New Recipe**
4. Fill in the form:
   - **Upload a photo** by clicking the upload box
   - **Title** — the recipe name
   - **Description** — a 1-2 sentence teaser shown on recipe cards
   - **Story** (optional) — the personal story behind the dish
   - **Category** — choose from the dropdown (Breakfast, Lunch, Dinner, etc.)
   - **Prep/Cook Time & Servings** — displayed on recipe cards and detail pages
   - **Ingredients** — put each ingredient on a new line
   - **Instructions** — put each step on a new line
   - **Tags** — comma-separated (e.g., "comfort food, weeknight, seasonal")
   - **Published** — check this to make it visible on the site
   - **Featured** — check this to show it as the homepage hero
5. Click **Create Recipe** — done!

You can also:
- **Edit** any recipe by clicking the Edit button
- **Publish/Unpublish** recipes with the eye icon
- **Feature/Unfeature** recipes with the star icon
- **Delete** recipes with the trash icon
- **Update photos** by editing a recipe and uploading a new image

---

## How Users Save Recipes

- Visitors can sign in with their Google account
- Once signed in, they can click the **bookmark icon** on any recipe card or recipe page
- Saved recipes appear under their **Saved Recipes** page (accessible from the nav menu)

---

## Instagram Grid Footer

The footer shows an Instagram-style photo grid. To customize it:

1. Go to Supabase **Table Editor > instagram_posts**
2. Add rows with:
   - `image_url` — URL to the image (upload to Supabase Storage or use any URL)
   - `caption` — optional caption text
   - `link` — URL to link to when clicked (e.g., Instagram post URL)
   - `sort_order` — number to control display order (0 = first)
3. Add 6 images for the best visual result

If no instagram_posts are in the database, placeholder images are shown automatically.

---

## Supabase Storage (Image Uploads)

The SQL setup script creates a public storage bucket called "images". If it didn't work automatically:

1. Go to Supabase **Storage**
2. Click **New Bucket**
3. Name it `images`
4. Check **Public bucket**
5. Go to the bucket's **Policies** tab and add:
   - SELECT policy: allow all users
   - INSERT policy: allow authenticated users

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and add your Supabase credentials
cp .env.example .env.local

# Run dev server
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure

```
src/
  app/
    page.tsx          — Homepage (hero + latest recipes)
    about/            — About page
    recipes/          — Recipe listing with category filters
    recipes/[slug]/   — Individual recipe page
    admin/            — Admin dashboard (recipe CRUD)
    auth/login/       — Google sign-in page
    auth/callback/    — OAuth callback handler
    saved/            — User's saved recipes
  components/
    Navbar.tsx        — Site navigation with auth
    Footer.tsx        — Footer with Instagram grid
    InstagramGrid.tsx — Instagram-style photo grid
    RecipeCard.tsx    — Recipe card component
    SaveButton.tsx    — Bookmark/save button
  lib/
    supabase-client.ts — Browser Supabase client
    supabase-server.ts — Server Supabase client
    categories.ts      — Recipe category constants
  types/
    database.ts        — TypeScript types
```
