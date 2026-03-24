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
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  content: {},
  updateContent: async () => {},
  getContent: (_key, fallback) => fallback,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState<SiteContent>({});
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      // Check admin status
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

      // Load all site content
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

  return (
    <AdminContext.Provider value={{ isAdmin, content, updateContent, getContent }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
