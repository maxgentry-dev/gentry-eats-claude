"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { RecipeCard } from "@/components/RecipeCard";
import { InlineEdit } from "@/components/InlineEdit";
import { CATEGORIES } from "@/lib/categories";
import type { Recipe } from "@/types/database";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      let query = supabase
        .from("recipes")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory);
      }

      const { data } = await query;
      setRecipes((data || []) as Recipe[]);
      setLoading(false);
    };
    fetchRecipes();
  }, [activeCategory]);

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <InlineEdit
            contentKey="recipes_label"
            fallback="Browse"
            as="p"
            className="text-sm tracking-widest uppercase text-warm-gray mb-3"
          />
          <InlineEdit
            contentKey="recipes_heading"
            fallback="All Recipes"
            as="h1"
            className="font-serif text-4xl md:text-6xl mb-4"
          />
          <InlineEdit
            contentKey="recipes_subheading"
            fallback="From comforting classics to new favorites, find your next meal here."
            as="p"
            className="text-charcoal-light max-w-lg mx-auto"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-sm tracking-widest uppercase transition-colors ${
                activeCategory === cat
                  ? "bg-charcoal text-cream"
                  : "bg-transparent text-charcoal-light border border-linen hover:border-charcoal"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-linen" />
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-20 bg-linen" />
                  <div className="h-6 w-3/4 bg-linen" />
                  <div className="h-4 w-full bg-linen" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-serif text-2xl italic text-warm-gray mb-4">
              No recipes found
            </p>
            <p className="text-charcoal-light">
              {activeCategory !== "All"
                ? `No ${activeCategory.toLowerCase()} recipes yet. Check back soon!`
                : "Recipes are on the way. Stay tuned!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
