"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase-client";

interface SiteContent {
  [key: string]: string;
}

interface AdminContextType {
  isAdmin: boolean;
  content: SiteContent;
  updateContent: (key: string, value: string) => Promise<void>;
  getContent: (key: string, fallback: string) => string;
  uploadImage: (file: File) => Promise<string | null>;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  content: {},
  updateContent: async () => {},
  getContent: (_key, fallback) => fallback,
  uploadImage: async () => null,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState<SiteContent>({});
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        if (profile?.is_admin) setIsAdmin(true);
      }

      const { data } = await supabase
        .from("site_content")
        .select("key, value");
      if (data) {
        const map: SiteContent = {};
        data.forEach((row: { key: string; value: string }) => {
          map[row.key] = row.value;
        });
        setContent(map);
      }
    };
    init();
  }, []);

  const updateContent = useCallback(
    async (key: string, value: string) => {
      setContent((prev) => ({ ...prev, [key]: value }));
      await supabase
        .from("site_content")
        .upsert({ key, value }, { onConflict: "key" });
    },
    [supabase]
  );

  const getContent = useCallback(
    (key: string, fallback: string) => {
      return content[key] ?? fallback;
    },
    [content]
  );

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `site-images/${fileName}`;

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
    },
    [supabase]
  );

  return (
    <AdminContext.Provider
      value={{ isAdmin, content, updateContent, getContent, uploadImage }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
