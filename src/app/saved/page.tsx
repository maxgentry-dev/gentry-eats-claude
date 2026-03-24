"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { RecipeCard } from "@/components/RecipeCard";
import type { Recipe } from "@/types/database";

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data } = await supabase
        .from("saved_recipes")
        .select("recipe_id, recipes(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const saved = data
          .map((s: { recipes: Recipe | Recipe[] | null }) => {
            if (Array.isArray(s.recipes)) return s.recipes[0];
            return s.recipes;
          })
          .filter(Boolean) as Recipe[];
        setRecipes(saved);
      }
      setLoading(false);
    };
    fetchSaved();
  }, []);

  if (!loading && !isAuthenticated) {
    return (
      <div className="pt-28 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl mb-4">Saved Recipes</h1>
          <p className="text-charcoal-light mb-8">
            Sign in to view your saved recipes.
          </p>
          <a href="/auth/login" className="btn-primary inline-block">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest uppercase text-warm-gray mb-3">
            Your Collection
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mb-4">
            Saved Recipes
          </h1>
          <p className="text-charcoal-light">
            Your personal cookbook of favorites.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-linen" />
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-20 bg-linen" />
                  <div className="h-6 w-3/4 bg-linen" />
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
              No saved recipes yet
            </p>
            <p className="text-charcoal-light mb-8">
              Browse recipes and tap the bookmark icon to save your favorites.
            </p>
            <a href="/recipes" className="btn-outline inline-block">
              Browse Recipes
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
