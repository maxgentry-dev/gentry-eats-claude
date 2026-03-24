"use client";

import { useRef, useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAdmin } from "@/lib/AdminContext";

interface InlineImageProps {
  contentKey: string;
  fallbackSrc: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  containerClassName?: string;
}

export function InlineImage({
  contentKey,
  fallbackSrc,
  alt,
  fill = true,
  className = "object-cover",
  priority = false,
  sizes,
  containerClassName = "",
}: InlineImageProps) {
  const { isAdmin, getContent, updateContent, uploadImage } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const currentSrc = getContent(contentKey, fallbackSrc);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      await updateContent(contentKey, url);
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <>
      <div className={`${containerClassName} relative`}>
        {fill ? (
          <Image
            src={currentSrc}
            alt={alt}
            fill
            className={className}
            priority={priority}
            sizes={sizes}
          />
        ) : (
          <Image
            src={currentSrc}
            alt={alt}
            width={800}
            height={1000}
            className={className}
            priority={priority}
            sizes={sizes}
          />
        )}
      </div>

      {isAdmin && (
        <div className="absolute top-24 right-6 z-50">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-sans tracking-wide rounded-sm shadow-lg hover:bg-accent-light transition-colors disabled:opacity-70"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Pencil size={16} />
            )}
            {uploading ? "Uploading..." : "Change Photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </>
  );
}
