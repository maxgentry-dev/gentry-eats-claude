"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { SaveButton } from "./SaveButton";
import type { Recipe } from "@/types/database";

interface RecipeCardProps {
  recipe: Recipe;
  showSave?: boolean;
}

export function RecipeCard({ recipe, showSave = true }: RecipeCardProps) {
  return (
    <div className="group cursor-pointer">
      <Link href={`/recipes/${recipe.slug}`}>
        <div className="overflow-hidden aspect-[3/4] relative bg-linen">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-warm-gray">
              <span className="font-serif text-lg italic">No image</span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 space-y-2">
        <p className="text-xs tracking-widest uppercase text-warm-gray">
          {recipe.category}
        </p>
        <div className="flex items-start justify-between gap-2">
          <Link href={`/recipes/${recipe.slug}`}>
            <h3 className="font-serif text-xl md:text-2xl leading-tight hover:text-charcoal-light transition-colors">
              {recipe.title}
            </h3>
          </Link>
          {showSave && <SaveButton recipeId={recipe.id} />}
        </div>
        <p className="text-sm text-charcoal-light leading-relaxed line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-warm-gray pt-1">
          {recipe.prep_time && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {recipe.prep_time}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users size={14} />
              {recipe.servings}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
