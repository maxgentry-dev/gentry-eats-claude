"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { RecipeCard } from "@/components/RecipeCard";
import { InlineEdit } from "@/components/InlineEdit";
import { InlineImage } from "@/components/InlineImage";
import Link from "next/link";
import type { Recipe } from "@/types/database";

export default function HomePage() {
  const [hero, setHero] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: featured } = await supabase
        .from("recipes")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (featured?.[0]) setHero(featured[0] as Recipe);

      const { data: latest } = await supabase
        .from("recipes")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (latest) setRecipes(latest as Recipe[]);
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <InlineImage
            contentKey="home_hero_image"
            fallbackSrc={
              hero?.image_url ||
              "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1920&q=80"
            }
            alt="Hero background"
            fill
            className="object-cover"
            priority
            containerClassName="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <InlineEdit
              contentKey="home_hero_label"
              fallback="Welcome to"
              as="p"
              className="text-sm tracking-[0.3em] uppercase text-cream/80 mb-4"
            />
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.9] mb-6">
              Gentry
              <br />
              <em className="font-normal">Eats</em>
            </h1>
            <InlineEdit
              contentKey="home_hero_tagline"
              fallback="Home-cooked elegance, one recipe at a time. Stories, seasons, and flavors gathered around the table."
              as="p"
              className="text-lg md:text-xl text-cream/80 leading-relaxed mb-10 max-w-lg font-light"
            />
            <div className="flex flex-wrap gap-4">
              <Link
                href="/recipes"
                className="btn-primary bg-cream text-charcoal hover:bg-linen"
              >
                Explore Recipes
              </Link>
              {hero && (
                <Link
                  href={`/recipes/${hero.slug}`}
                  className="btn-outline border-cream text-cream hover:bg-cream hover:text-charcoal"
                >
                  Featured: {hero.title}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <InlineEdit
            contentKey="home_intro_label"
            fallback="The Story"
            as="p"
            className="text-sm tracking-widest uppercase text-warm-gray mb-4"
          />
          <InlineEdit
            contentKey="home_intro_heading"
            fallback="Where Every Meal Tells a Story"
            as="h2"
            className="section-heading mb-6"
          />
          <InlineEdit
            contentKey="home_intro_text"
            fallback="Gentry Eats is a celebration of the art of home cooking — recipes crafted with care, plated with intention, and shared with love. From weeknight staples to weekend feasts, every dish is an invitation to slow down and savor the moment."
            as="p"
            className="text-charcoal-light leading-relaxed text-lg"
            multiline
          />
        </div>
      </section>

      {/* Latest Recipes Grid */}
      <section className="py-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <InlineEdit
                contentKey="home_recipes_label"
                fallback="From the Kitchen"
                as="p"
                className="text-sm tracking-widest uppercase text-warm-gray mb-2"
              />
              <InlineEdit
                contentKey="home_recipes_heading"
                fallback="Latest Recipes"
                as="h2"
                className="section-heading"
              />
            </div>
            <Link
              href="/recipes"
              className="hidden md:block text-sm tracking-widest uppercase text-charcoal-light hover:text-charcoal transition-colors border-b border-charcoal-light pb-1"
            >
              View All
            </Link>
          </div>

          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-2xl italic text-warm-gray mb-4">
                Recipes are coming soon
              </p>
              <p className="text-charcoal-light">
                The kitchen is warming up. Check back for delicious things.
              </p>
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link href="/recipes" className="btn-outline">
              View All Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-charcoal text-cream">
        <div className="max-w-3xl mx-auto text-center">
          <InlineEdit
            contentKey="home_cta_heading"
            fallback="Never Miss a Recipe"
            as="h2"
            className="font-serif text-3xl md:text-5xl mb-6"
          />
          <InlineEdit
            contentKey="home_cta_text"
            fallback="Follow along on Instagram for behind-the-scenes moments, kitchen stories, and all the latest from Gentry Eats."
            as="p"
            className="text-cream/70 text-lg mb-8"
            multiline
          />
          <a
            href="https://instagram.com/gentry_eats"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary bg-cream text-charcoal hover:bg-linen inline-block"
          >
            Follow @gentry_eats
          </a>
        </div>
      </section>
    </>
  );
}
