"use client";

import Link from "next/link";
import { InstagramGrid } from "./InstagramGrid";

function InstagramIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Instagram Grid Section */}
      <div className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center mb-10">
          <p className="text-sm tracking-widest uppercase text-warm-gray mb-2">
            Follow Along
          </p>
          <a
            href="https://instagram.com/gentry_eats"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-serif text-2xl md:text-3xl hover:text-accent-light transition-colors"
          >
            <InstagramIcon size={28} />
            @gentry_eats
          </a>
        </div>
        <InstagramGrid />
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-charcoal-light/30">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Gentry Eats
          </Link>
          <div className="flex items-center gap-8 text-sm text-warm-gray">
            <Link href="/recipes" className="hover:text-cream transition-colors">
              Recipes
            </Link>
            <Link href="/about" className="hover:text-cream transition-colors">
              About
            </Link>
          </div>
          <p className="text-xs text-warm-gray">
            &copy; {new Date().getFullYear()} Gentry Eats. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
