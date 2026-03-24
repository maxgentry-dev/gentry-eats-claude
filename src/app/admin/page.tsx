"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import { CATEGORIES } from "@/lib/categories";
import {
  Plus,
  Trash2,
  Save,
  ImagePlus,
  Eye,
  EyeOff,
  Star,
  StarOff,
  X,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import type { Recipe, Profile } from "@/types/database";

interface RecipeForm {
  title: string;
  slug: string;
  description: string;
  story: string;
  ingredients: string;
  instructions: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  category: string;
  tags: string;
  featured: boolean;
  published: boolean;
  image_url: string;
}

const emptyForm: RecipeForm = {
  title: "",
  slug: "",
  description: "",
  story: "",
  ingredients: "",
  instructions: "",
  prep_time: "",
  cook_time: "",
  servings: "",
  category: "Dinner",
  tags: "",
  featured: false,
  published: false,
  image_url: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<RecipeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const supabase = createClient();

  const fetchRecipes = useCallback(async () => {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecipes(data as Recipe[]);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData?.is_admin) {
        window.location.href = "/";
        return;
      }

      setProfile(profileData);
      await fetchRecipes();
      setLoading(false);
    };
    checkAdmin();
  }, [fetchRecipes]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const filePath = `recipe-images/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    let imageUrl = form.image_url;

    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imageUrl = url;
    }

    const recipeData = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description,
      story: form.story || null,
      ingredients: form.ingredients
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      instructions: form.instructions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      prep_time: form.prep_time || null,
      cook_time: form.cook_time || null,
      servings: form.servings || null,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      featured: form.featured,
      published: form.published,
      image_url: imageUrl || null,
      author_id: profile!.id,
    };

    if (editing) {
      await supabase.from("recipes").update(recipeData).eq("id", editing);
    } else {
      await supabase.from("recipes").insert(recipeData);
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    await fetchRecipes();
    setSaving(false);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditing(recipe.id);
    setForm({
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      story: recipe.story || "",
      ingredients: recipe.ingredients.join("\n"),
      instructions: recipe.instructions.join("\n"),
      prep_time: recipe.prep_time || "",
      cook_time: recipe.cook_time || "",
      servings: recipe.servings || "",
      category: recipe.category,
      tags: recipe.tags.join(", "),
      featured: recipe.featured,
      published: recipe.published,
      image_url: recipe.image_url || "",
    });
    setImagePreview(recipe.image_url || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    await supabase.from("recipes").delete().eq("id", id);
    await fetchRecipes();
  };

  const togglePublished = async (recipe: Recipe) => {
    await supabase
      .from("recipes")
      .update({ published: !recipe.published })
      .eq("id", recipe.id);
    await fetchRecipes();
  };

  const toggleFeatured = async (recipe: Recipe) => {
    await supabase
      .from("recipes")
      .update({ featured: !recipe.featured })
      .eq("id", recipe.id);
    await fetchRecipes();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="pt-28 pb-24 px-6 min-h-screen flex items-center justify-center">
        <p className="text-warm-gray font-serif text-xl italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-sm tracking-widest uppercase text-warm-gray mb-2">
              Dashboard
            </p>
            <h1 className="font-serif text-4xl">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setImageFile(null);
                setImagePreview(null);
                setShowForm(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              New Recipe
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-warm-gray hover:text-charcoal transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Recipe Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-charcoal/50 flex items-start justify-center overflow-y-auto py-12 px-4">
            <div className="bg-cream w-full max-w-3xl p-8 relative">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-4 right-4 text-warm-gray hover:text-charcoal"
              >
                <X size={24} />
              </button>

              <h2 className="font-serif text-2xl mb-8">
                {editing ? "Edit Recipe" : "New Recipe"}
              </h2>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipe Photo
                  </label>
                  <div className="flex items-start gap-4">
                    {imagePreview && (
                      <div className="relative w-32 h-32 bg-linen flex-shrink-0">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-linen hover:border-charcoal cursor-pointer transition-colors">
                      <ImagePlus size={24} className="text-warm-gray" />
                      <span className="text-xs text-warm-gray mt-1">
                        Upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: editing ? form.slug : slugify(e.target.value),
                      });
                    }}
                    className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                    placeholder="Recipe title"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors text-sm text-charcoal-light"
                    placeholder="auto-generated-from-title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                    placeholder="A brief description for recipe cards"
                  />
                </div>

                {/* Story */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    The Story (optional)
                  </label>
                  <textarea
                    value={form.story}
                    onChange={(e) =>
                      setForm({ ...form, story: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                    placeholder="The story behind this recipe..."
                  />
                </div>

                {/* Row: Category, Prep, Cook, Servings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prep Time
                    </label>
                    <input
                      type="text"
                      value={form.prep_time}
                      onChange={(e) =>
                        setForm({ ...form, prep_time: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                      placeholder="15 min"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cook Time
                    </label>
                    <input
                      type="text"
                      value={form.cook_time}
                      onChange={(e) =>
                        setForm({ ...form, cook_time: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                      placeholder="30 min"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Servings
                    </label>
                    <input
                      type="text"
                      value={form.servings}
                      onChange={(e) =>
                        setForm({ ...form, servings: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                      placeholder="4"
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ingredients * (one per line)
                  </label>
                  <textarea
                    value={form.ingredients}
                    onChange={(e) =>
                      setForm({ ...form, ingredients: e.target.value })
                    }
                    rows={8}
                    className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors font-mono text-sm"
                    placeholder={
                      "2 cups all-purpose flour\n1 tsp salt\n3 large eggs"
                    }
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Instructions * (one step per line)
                  </label>
                  <textarea
                    value={form.instructions}
                    onChange={(e) =>
                      setForm({ ...form, instructions: e.target.value })
                    }
                    rows={8}
                    className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors font-mono text-sm"
                    placeholder={
                      "Preheat oven to 375°F.\nCombine flour and salt in a large bowl.\nWhisk eggs separately, then fold in."
                    }
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) =>
                      setForm({ ...form, tags: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-linen focus:border-charcoal outline-none transition-colors"
                    placeholder="comfort food, weeknight, seasonal"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) =>
                        setForm({ ...form, published: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm({ ...form, featured: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.description}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Update Recipe"
                      : "Create Recipe"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipes List */}
        <div className="space-y-4">
          {recipes.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-linen">
              <p className="font-serif text-xl italic text-warm-gray mb-4">
                No recipes yet
              </p>
              <p className="text-charcoal-light mb-6">
                Click &ldquo;New Recipe&rdquo; to add your first recipe.
              </p>
            </div>
          ) : (
            recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-4 p-4 bg-white border border-linen hover:border-charcoal/20 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 relative bg-linen flex-shrink-0">
                  {recipe.image_url ? (
                    <Image
                      src={recipe.image_url}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warm-gray text-xs">
                      No img
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg truncate">{recipe.title}</h3>
                  <p className="text-xs text-warm-gray">
                    {recipe.category} &middot;{" "}
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="hidden sm:flex items-center gap-2">
                  {recipe.published ? (
                    <span className="px-2 py-1 text-xs bg-sage/20 text-sage">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-linen text-warm-gray">
                      Draft
                    </span>
                  )}
                  {recipe.featured && (
                    <span className="px-2 py-1 text-xs bg-accent/20 text-accent">
                      Featured
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublished(recipe)}
                    className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                    title={recipe.published ? "Unpublish" : "Publish"}
                  >
                    {recipe.published ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => toggleFeatured(recipe)}
                    className="p-2 text-warm-gray hover:text-accent transition-colors"
                    title={recipe.featured ? "Unfeature" : "Feature"}
                  >
                    {recipe.featured ? (
                      <Star size={18} className="fill-accent text-accent" />
                    ) : (
                      <StarOff size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="px-3 py-1 text-sm border border-linen hover:border-charcoal transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-2 text-warm-gray hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
