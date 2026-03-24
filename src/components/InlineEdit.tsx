"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";

interface InlineEditProps {
  contentKey: string;
  fallback: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  className?: string;
  multiline?: boolean;
}

export function InlineEdit({
  contentKey,
  fallback,
  as: Tag = "p",
  className = "",
  multiline = false,
}: InlineEditProps) {
  const { isAdmin, getContent, updateContent } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const displayValue = getContent(contentKey, fallback);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = () => {
    setValue(displayValue);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateContent(contentKey, value);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (editing) {
    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className={`w-full bg-white/90 border-2 border-accent px-3 py-2 outline-none resize-y ${className}`}
            style={{ fontFamily: "inherit", fontSize: "inherit" }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full bg-white/90 border-2 border-accent px-3 py-1 outline-none ${className}`}
            style={{ fontFamily: "inherit", fontSize: "inherit" }}
          />
        )}
        <div className="absolute -top-8 right-0 flex items-center gap-1 z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1 bg-sage text-white rounded-sm hover:bg-sage/80 transition-colors"
            title="Save"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 bg-warm-gray text-white rounded-sm hover:bg-warm-gray/80 transition-colors"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tag className={`${className} ${isAdmin ? "relative group/edit cursor-pointer" : ""}`}>
      {isAdmin && (
        <button
          onClick={startEditing}
          className="absolute -top-2 -right-2 opacity-0 group-hover/edit:opacity-100 transition-opacity p-1 bg-accent text-white rounded-full shadow-md z-10 hover:bg-accent-light"
          title="Edit"
        >
          <Pencil size={12} />
        </button>
      )}
      {displayValue}
    </Tag>
  );
}
