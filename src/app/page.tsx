import { createServerSupabaseClient } from "@/lib/supabase-server";
import { RecipeCard } from "@/components/RecipeCard";
import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: featuredRecipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(1);

  const { data: latestRecipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const hero = featuredRecipes?.[0] as Recipe | undefined;
  const recipes = (latestRecipes || []) as Recipe[];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          {hero?.image_url ? (
            <Image
              src={hero.image_url}
              alt={hero.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <Image
              src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1920&q=80"
              alt="Elegant table setting"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.3em] uppercase text-cream/80 mb-4">
              Welcome to
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.9] mb-6">
              Gentry
              <br />
              <em className="font-normal">Eats</em>
            </h1>
            <p className="text-lg md:text-xl text-cream/80 leading-relaxed mb-10 max-w-lg font-light">
              Home-cooked elegance, one recipe at a time. Stories, seasons, and
              flavors gathered around the table.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/recipes" className="btn-primary bg-cream text-charcoal hover:bg-linen">
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
          <p className="text-sm tracking-widest uppercase text-warm-gray mb-4">
            The Story
          </p>
          <h2 className="section-heading mb-6">
            Where Every Meal Tells a Story
          </h2>
          <p className="text-charcoal-light leading-relaxed text-lg">
            Gentry Eats is a celebration of the art of home cooking &mdash;
            recipes crafted with care, plated with intention, and shared with
            love. From weeknight staples to weekend feasts, every dish is an
            invitation to slow down and savor the moment.
          </p>
        </div>
      </section>

      {/* Latest Recipes Grid */}
      <section className="py-12 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm tracking-widest uppercase text-warm-gray mb-2">
                From the Kitchen
              </p>
              <h2 className="section-heading">Latest Recipes</h2>
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
          <h2 className="font-serif text-3xl md:text-5xl mb-6">
            Never Miss a Recipe
          </h2>
          <p className="text-cream/70 text-lg mb-8">
            Follow along on Instagram for behind-the-scenes moments, kitchen
            stories, and all the latest from Gentry Eats.
          </p>
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
