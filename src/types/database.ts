export interface Recipe {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  description: string;
  story: string | null;
  ingredients: string[];
  instructions: string[];
  prep_time: string | null;
  cook_time: string | null;
  servings: string | null;
  category: string;
  tags: string[];
  image_url: string | null;
  featured: boolean;
  published: boolean;
  author_id: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
  recipe?: Recipe;
}

export interface InstagramPost {
  id: string;
  image_url: string;
  caption: string | null;
  link: string | null;
  sort_order: number;
}
