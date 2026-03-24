"use client";

import { useRef } from "react";
import { Pencil } from "lucide-react";
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

  const currentSrc = getContent(contentKey, fallbackSrc);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      await updateContent(contentKey, url);
    }
    e.target.value = "";
  };

  return (
    <div className={`${containerClassName} ${isAdmin ? "relative group/img" : "relative"}`}>
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

      {isAdmin && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-2 px-3 py-2 bg-accent text-white text-xs font-sans tracking-wide rounded-sm shadow-lg hover:bg-accent-light z-20"
          >
            <Pencil size={14} />
            Change Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
