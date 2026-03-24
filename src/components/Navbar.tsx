"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Menu, X, User, LogOut, Bookmark, Shield } from "lucide-react";
import type { Profile } from "@/types/database";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    getProfile();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setShowUserMenu(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl md:text-3xl tracking-tight">
            Gentry Eats
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              href="/recipes"
              className="text-sm tracking-widest uppercase text-charcoal-light hover:text-charcoal transition-colors"
            >
              Recipes
            </Link>
            <Link
              href="/about"
              className="text-sm tracking-widest uppercase text-charcoal-light hover:text-charcoal transition-colors"
            >
              About
            </Link>

            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm tracking-widest uppercase text-charcoal-light hover:text-charcoal transition-colors"
                >
                  <User size={18} />
                  {profile.full_name?.split(" ")[0] || "Account"}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-cream border border-linen shadow-lg py-2">
                    {profile.is_admin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream-dark transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/saved"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-cream-dark transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Bookmark size={16} />
                      Saved Recipes
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-cream-dark transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm tracking-widest uppercase text-charcoal-light hover:text-charcoal transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-6 border-t border-linen/50">
            <div className="flex flex-col gap-4 pt-6">
              <Link
                href="/recipes"
                className="text-sm tracking-widest uppercase"
                onClick={() => setIsOpen(false)}
              >
                Recipes
              </Link>
              <Link
                href="/about"
                className="text-sm tracking-widest uppercase"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              {profile ? (
                <>
                  {profile.is_admin && (
                    <Link
                      href="/admin"
                      className="text-sm tracking-widest uppercase"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/saved"
                    className="text-sm tracking-widest uppercase"
                    onClick={() => setIsOpen(false)}
                  >
                    Saved Recipes
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm tracking-widest uppercase text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm tracking-widest uppercase"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
