"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import type { InstagramPost } from "@/types/database";

const PLACEHOLDER_POSTS: InstagramPost[] = Array.from({ length: 6 }, (_, i) => ({
  id: `placeholder-${i}`,
  image_url: `https://images.unsplash.com/photo-${
    [
      "1504674900247-0877df9cc836",
      "1476124369491-e7addf5db371",
      "1565299624946-b28f40a0ae38",
      "1482049016530-d981e8ae2b4a",
      "1540189549336-e6e99c3679fe",
      "1567620905732-2d1ec7ab7445",
    ][i]
  }?w=400&h=400&fit=crop`,
  caption: null,
  link: "https://instagram.com/gentry_eats",
  sort_order: i,
}));

export function InstagramGrid() {
  const [posts, setPosts] = useState<InstagramPost[]>(PLACEHOLDER_POSTS);
  const supabase = createClient();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("instagram_posts")
        .select("*")
        .order("sort_order", { ascending: true })
        .limit(6);
      if (data && data.length > 0) setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-3 md:grid-cols-6 gap-1">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.link || "https://instagram.com/gentry_eats"}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-square relative overflow-hidden group"
        >
          <Image
            src={post.image_url}
            alt={post.caption || "Instagram post"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 33vw, 16vw"
          />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors duration-300" />
        </a>
      ))}
    </div>
  );
}
