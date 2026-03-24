import { createServerSupabaseClient } from "@/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ArrowLeft } from "lucide-react";
import { SaveButton } from "@/components/SaveButton";
import type { Recipe } from "@/types/database";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) notFound();

  const recipe = data as Recipe;

  return (
    <article className="pt-24">
      {/* Hero Image */}
      <div className="relative h-[60vh] md:h-[70vh]">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-linen flex items-center justify-center">
            <span className="font-serif text-2xl italic text-warm-gray">
              {recipe.title}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
      </div>

      {/* Recipe Content */}
      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-cream p-8 md:p-12">
          {/* Back Link */}
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            All Recipes
          </Link>

          {/* Category */}
          <p className="text-xs tracking-widest uppercase text-warm-gray mb-3">
            {recipe.category}
          </p>

          {/* Title */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="font-serif text-3xl md:text-5xl leading-tight">
              {recipe.title}
            </h1>
            <SaveButton recipeId={recipe.id} />
          </div>

          {/* Description */}
          <p className="text-lg text-charcoal-light leading-relaxed mb-8">
            {recipe.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap gap-6 pb-8 mb-8 border-b border-linen">
            {recipe.prep_time && (
              <div className="flex items-center gap-2 text-sm text-charcoal-light">
                <Clock size={16} />
                <span>
                  <strong className="text-charcoal">Prep:</strong>{" "}
                  {recipe.prep_time}
                </span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-2 text-sm text-charcoal-light">
                <Clock size={16} />
                <span>
                  <strong className="text-charcoal">Cook:</strong>{" "}
                  {recipe.cook_time}
                </span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2 text-sm text-charcoal-light">
                <Users size={16} />
                <span>
                  <strong className="text-charcoal">Serves:</strong>{" "}
                  {recipe.servings}
                </span>
              </div>
            )}
          </div>

          {/* Story */}
          {recipe.story && (
            <div className="mb-10">
              <h2 className="font-serif text-2xl mb-4">The Story</h2>
              <div className="text-charcoal-light leading-relaxed whitespace-pre-line">
                {recipe.story}
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div className="mb-10">
            <h2 className="font-serif text-2xl mb-6">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-charcoal-light"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-10">
            <h2 className="font-serif text-2xl mb-6">Instructions</h2>
            <ol className="space-y-6">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-serif text-2xl text-linen flex-shrink-0 w-8">
                    {i + 1}
                  </span>
                  <p className="text-charcoal-light leading-relaxed pt-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="pt-8 border-t border-linen">
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs tracking-widest uppercase bg-cream-dark text-charcoal-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="h-24" />
    </article>
  );
}
