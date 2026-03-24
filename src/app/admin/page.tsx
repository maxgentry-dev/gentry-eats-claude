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
import type { Recipe, Profile, InstagramPost } from "@/types/database";

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
  const [igPosts, setIgPosts] = useState<InstagramPost[]>([]);
  const [igUploading, setIgUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"recipes" | "instagram">("recipes");
  const supabase = createClient();

  const fetchRecipes = useCallback(async () => {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecipes(data as Recipe[]);
  }, []);

  const fetchIgPosts = useCallback(async () => {
    const { data } = await supabase
      .from("instagram_posts")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setIgPosts(data as InstagramPost[]);
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
      await fetchIgPosts();
      setLoading(false);
    };
    checkAdmin();
  }, [fetchRecipes, fetchIgPosts]);

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

  const handleIgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIgUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadImage(file);
      if (url) {
        const nextOrder = igPosts.length + i;
        await supabase.from("instagram_posts").insert({
          image_url: url,
          link: "https://instagram.com/gentry_eats",
          sort_order: nextOrder,
        });
      }
    }

    await fetchIgPosts();
    setIgUploading(false);
    e.target.value = "";
  };

  const handleIgDelete = async (id: string) => {
    await supabase.from("instagram_posts").delete().eq("id", id);
    await fetchIgPosts();
  };

  const handleIgLinkUpdate = async (id: string, link: string) => {
    await supabase.from("instagram_posts").update({ link }).eq("id", id);
    await fetchIgPosts();
  };

  const handleIgReorder = async (id: string, direction: "up" | "down") => {
    const idx = igPosts.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= igPosts.length) return;

    const currentOrder = igPosts[idx].sort_order;
    const swapOrder = igPosts[swapIdx].sort_order;

    await supabase
      .from("instagram_posts")
      .update({ sort_order: swapOrder })
      .eq("id", igPosts[idx].id);
    await supabase
      .from("instagram_posts")
      .update({ sort_order: currentOrder })
      .eq("id", igPosts[swapIdx].id);

    await fetchIgPosts();
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

        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-linen">
          <button
            onClick={() => setActiveTab("recipes")}
            className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === "recipes"
                ? "text-charcoal border-b-2 border-charcoal"
                : "text-warm-gray hover:text-charcoal"
            }`}
          >
            Recipes ({recipes.length})
          </button>
          <button
            onClick={() => setActiveTab("instagram")}
            className={`pb-3 text-sm tracking-widest uppercase transition-colors ${
              activeTab === "instagram"
                ? "text-charcoal border-b-2 border-charcoal"
                : "text-warm-gray hover:text-charcoal"
            }`}
          >
            Instagram Grid ({igPosts.length})
          </button>
        </div>

        {/* Recipes Tab */}
        {activeTab === "recipes" && (
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
        )}

        {/* Instagram Tab */}
        {activeTab === "instagram" && (
          <div>
            {/* Info + Upload */}
            <div className="mb-8 p-6 bg-white border border-linen">
              <h3 className="font-serif text-xl mb-2">Instagram Footer Grid</h3>
              <p className="text-sm text-charcoal-light mb-4">
                Upload photos from your recent Instagram posts. These appear in the
                footer of every page. For the best look, use <strong>6 square photos</strong>.
                You can optionally add a link to each post so visitors go straight to
                your Instagram.
              </p>
              <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                <ImagePlus size={18} />
                {igUploading ? "Uploading..." : "Upload Photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleIgUpload}
                  disabled={igUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Grid Preview */}
            {igPosts.length > 0 ? (
              <div className="space-y-3">
                {igPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-4 p-4 bg-white border border-linen"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 relative bg-linen flex-shrink-0">
                      <Image
                        src={post.image_url}
                        alt={post.caption || `Instagram photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Order number */}
                    <div className="text-center flex-shrink-0 w-8">
                      <span className="font-serif text-lg text-warm-gray">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Link input */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs text-warm-gray mb-1">
                        Instagram post link
                      </label>
                      <input
                        type="text"
                        defaultValue={post.link || ""}
                        placeholder="https://instagram.com/p/..."
                        onBlur={(e) =>
                          handleIgLinkUpdate(post.id, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-cream border border-linen focus:border-charcoal outline-none transition-colors text-sm"
                      />
                    </div>

                    {/* Reorder + Delete */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleIgReorder(post.id, "up")}
                        disabled={idx === 0}
                        className="p-2 text-warm-gray hover:text-charcoal transition-colors disabled:opacity-30"
                        title="Move up"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleIgReorder(post.id, "down")}
                        disabled={idx === igPosts.length - 1}
                        className="p-2 text-warm-gray hover:text-charcoal transition-colors disabled:opacity-30"
                        title="Move down"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleIgDelete(post.id)}
                        className="p-2 text-warm-gray hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Live preview */}
                <div className="mt-8">
                  <p className="text-sm tracking-widest uppercase text-warm-gray mb-4">
                    Footer Preview
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-1 bg-charcoal p-4 rounded">
                    {igPosts.slice(0, 6).map((post, idx) => (
                      <div
                        key={post.id}
                        className="aspect-square relative overflow-hidden"
                      >
                        <Image
                          src={post.image_url}
                          alt={post.caption || `Preview ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {igPosts.length > 6 && (
                    <p className="text-xs text-warm-gray mt-2">
                      Only the first 6 photos are shown in the footer.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-linen">
                <ImagePlus size={40} className="text-linen mx-auto mb-4" />
                <p className="font-serif text-xl italic text-warm-gray mb-2">
                  No Instagram photos yet
                </p>
                <p className="text-sm text-charcoal-light">
                  Upload photos above to fill the footer grid. Placeholder
                  images will show until you add your own.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
