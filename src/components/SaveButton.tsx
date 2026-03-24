"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export function SaveButton({ recipeId }: { recipeId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("saved_recipes")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId)
        .maybeSingle();

      if (data) setSaved(true);
    };
    checkSaved();
  }, [recipeId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      window.location.href = "/auth/login";
      return;
    }

    setLoading(true);
    if (saved) {
      await supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipeId);
      setSaved(false);
    } else {
      await supabase
        .from("saved_recipes")
        .insert({ user_id: userId, recipe_id: recipeId });
      setSaved(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className="flex-shrink-0 p-1 hover:text-accent transition-colors disabled:opacity-50"
      aria-label={saved ? "Remove from saved" : "Save recipe"}
    >
      <Bookmark
        size={20}
        className={saved ? "fill-accent text-accent" : "text-warm-gray"}
      />
    </button>
  );
}
