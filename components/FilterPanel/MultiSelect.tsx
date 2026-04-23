"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

type Props = {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  freeInput?: boolean;
};

export function MultiSelect({ options, selected, onChange, placeholder, freeInput }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(
    (o) =>
      !selected.includes(o) &&
      o.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value]
    );
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (freeInput && e.key === "Enter" && search.trim()) {
      if (!selected.includes(search.trim())) {
        onChange([...selected, search.trim()]);
      }
      setSearch("");
    }
  };

  return (
    <div className="relative">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs"
            >
              {s}
              <button onClick={() => toggle(s)}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="w-full bg-white/5 text-white/80 text-xs rounded-lg px-3 py-2 pr-7 outline-none border border-white/10 focus:border-white/30 transition-colors placeholder:text-white/25"
        />
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
        />
      </div>

      {/* Dropdown */}
      {open && (filtered.length > 0 || (freeInput && search.trim())) && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg bg-black/95 border border-white/10 shadow-xl z-30 max-h-36 overflow-y-auto backdrop-blur-sm">
          {freeInput && search.trim() && !selected.includes(search.trim()) && (
            <button
              onMouseDown={() => {
                onChange([...selected, search.trim()]);
                setSearch("");
              }}
              className="w-full text-left px-3 py-2 text-xs text-white/50 hover:bg-white/5"
            >
              Add &quot;{search.trim()}&quot;
            </button>
          )}
          {filtered.map((o) => (
            <button
              key={o}
              onMouseDown={() => toggle(o)}
              className="w-full text-left px-3 py-2 text-xs text-white/60 hover:bg-white/5"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
