"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAdmin } from "@/lib/AdminContext";

const FONT_OPTIONS = [
  { label: "Serif (Playfair)", value: "'Playfair Display', Georgia, serif" },
  { label: "Sans (Inter)", value: "'Inter', system-ui, sans-serif" },
  { label: "System Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "System Sans", value: "system-ui, -apple-system, sans-serif" },
  { label: "Monospace", value: "'Courier New', Courier, monospace" },
];

const SIZE_OPTIONS = [
  { label: "XS", value: "0.75rem" },
  { label: "SM", value: "0.875rem" },
  { label: "Base", value: "1rem" },
  { label: "LG", value: "1.125rem" },
  { label: "XL", value: "1.25rem" },
  { label: "2XL", value: "1.5rem" },
  { label: "3XL", value: "1.875rem" },
  { label: "4XL", value: "2.25rem" },
  { label: "5XL", value: "3rem" },
  { label: "6XL", value: "3.75rem" },
];

interface StyleData {
  font?: string;
  size?: string;
}

function parseStyleKey(raw: string | undefined): StyleData {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StyleData;
  } catch {
    return {};
  }
}

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
  const [selectedFont, setSelectedFont] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const displayValue = getContent(contentKey, fallback);
  const styleRaw = getContent(`${contentKey}__style`, "");
  const parsedStyle = parseStyleKey(styleRaw || undefined);

  const inlineStyle: React.CSSProperties = {};
  if (parsedStyle.font) inlineStyle.fontFamily = parsedStyle.font;
  if (parsedStyle.size) inlineStyle.fontSize = parsedStyle.size;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = () => {
    setValue(displayValue);
    setSelectedFont(parsedStyle.font || "");
    setSelectedSize(parsedStyle.size || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateContent(contentKey, value);

    const newStyle: StyleData = {};
    if (selectedFont) newStyle.font = selectedFont;
    if (selectedSize) newStyle.size = selectedSize;

    if (Object.keys(newStyle).length > 0) {
      await updateContent(`${contentKey}__style`, JSON.stringify(newStyle));
    } else if (styleRaw) {
      // Clear style if user reset to defaults
      await updateContent(`${contentKey}__style`, "");
    }

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
    const previewStyle: React.CSSProperties = {};
    if (selectedFont) previewStyle.fontFamily = selectedFont;
    if (selectedSize) previewStyle.fontSize = selectedSize;

    return (
      <div className="relative w-full">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-charcoal/90 rounded-sm">
          {/* Font picker */}
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="px-2 py-1 text-xs bg-charcoal-light text-cream border border-warm-gray/30 rounded-sm outline-none"
          >
            <option value="">Default Font</option>
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Size picker */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="px-2 py-1 text-xs bg-charcoal-light text-cream border border-warm-gray/30 rounded-sm outline-none"
          >
            <option value="">Default Size</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} ({s.value})
              </option>
            ))}
          </select>

          {/* Save / Cancel */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-2 py-1 bg-sage text-white text-xs rounded-sm hover:bg-sage/80 transition-colors disabled:opacity-50"
            >
              <Check size={12} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-2 py-1 bg-warm-gray text-white text-xs rounded-sm hover:bg-warm-gray/80 transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>

        {/* Editor */}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className="w-full bg-white/90 border-2 border-accent px-3 py-2 outline-none resize-y text-charcoal"
            style={previewStyle}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white/90 border-2 border-accent px-3 py-1 outline-none text-charcoal"
            style={previewStyle}
          />
        )}
      </div>
    );
  }

  return (
    <Tag
      className={`${className} ${isAdmin ? "relative group/edit cursor-pointer" : ""}`}
      style={inlineStyle}
    >
      {isAdmin && (
        <button
          onClick={startEditing}
          className="absolute -top-2 -right-2 opacity-0 group-hover/edit:opacity-100 transition-opacity p-1.5 bg-accent text-white rounded-full shadow-md z-10 hover:bg-accent-light"
          title="Edit text"
        >
          <Pencil size={12} />
        </button>
      )}
      {displayValue}
    </Tag>
  );
}
