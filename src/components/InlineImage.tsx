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
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const currentSrc = localPreview || getContent(contentKey, fallbackSrc);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Show immediate preview using local blob URL
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    setUploading(true);

    try {
      const url = await uploadImage(file);
      if (url) {
        await updateContent(contentKey, url);
        setLocalPreview(null); // Clear preview, real URL is now in context
      } else {
        setError(
          "Upload failed. Make sure the 'images' storage bucket exists in Supabase and is set to public."
        );
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setError(
        "Upload failed. Check browser console for details. Make sure the 'images' storage bucket exists in Supabase."
      );
    }

    setUploading(false);
    e.target.value = "";
  };

  // Use unoptimized for blob URLs since Next.js Image can't optimize them
  const isBlob = currentSrc.startsWith("blob:");

  return (
    <>
      <div className={`${containerClassName} relative`}>
        {isBlob ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentSrc}
            alt={alt}
            className={`${className} ${fill ? "absolute inset-0 w-full h-full" : ""}`}
          />
        ) : fill ? (
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
        <div className="absolute top-24 right-6 z-50 flex flex-col items-end gap-2">
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
          {error && (
            <div className="max-w-xs bg-red-600 text-white text-xs px-3 py-2 rounded-sm shadow-lg">
              {error}
            </div>
          )}
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
