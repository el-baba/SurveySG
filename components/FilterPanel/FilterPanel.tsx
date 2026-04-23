"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { MARITAL_STATUS_OPTIONS, EDUCATION_LEVEL_OPTIONS, Sex } from "@/lib/filters";
import { AgeRangeSlider } from "./AgeRangeSlider";
import { FilterChips } from "./FilterChips";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Female", label: "🙎‍♀️" },
  { value: "Male", label: "👨‍💼" },
];

export function FilterPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    sex, setSex,
    ageMin, ageMax, setAgeRange,
    maritalStatus, setMaritalStatus,
    educationLevel, setEducationLevel,
    resetFilters,
  } = useFilterStore();

  const hasFilters =
    sex !== "All" ||
    ageMin > 0 ||
    ageMax < 100 ||
    maritalStatus.length > 0 ||
    educationLevel.length > 0;

  return (
    <div
      className="absolute top-4 left-4 z-20 w-72 rounded-2xl overflow-hidden text-sm"
      style={{
        background: "var(--glass-bg-heavy)",
        border: "1px solid var(--glass-border)",
        borderTop: "1px solid var(--glass-border-highlight)",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 font-semibold text-white/90">
          <SlidersHorizontal size={16} className="text-white/50" />
          <span>Filters</span>
          {hasFilters && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/15 text-white/80 text-xs font-bold">
              active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-white/30 hover:text-red-400 transition-colors"
              title="Reset all filters"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Sex */}
          <FilterSection label="Sex">
            <div className="flex gap-2">
              {SEX_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSex(value)}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                    sex === value
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Age */}
          <FilterSection label={`Age: ${ageMin}–${ageMax}`}>
            <AgeRangeSlider
              min={ageMin}
              max={ageMax}
              onChange={setAgeRange}
            />
          </FilterSection>

          {/* Marital Status */}
          <FilterSection label="Marital Status">
            <div className="flex flex-wrap gap-1.5">
              {MARITAL_STATUS_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    setMaritalStatus(
                      maritalStatus.includes(m)
                        ? maritalStatus.filter((s) => s !== m)
                        : [...maritalStatus, m]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    maritalStatus.includes(m)
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Education Level */}
          <FilterSection label="Education Level">
            <select
              value={educationLevel[0] ?? ""}
              onChange={(e) =>
                setEducationLevel(e.target.value ? [e.target.value] : [])
              }
              className="w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: educationLevel.length ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
              }}
            >
              <option value="">Any level...</option>
              {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt} style={{ background: "#1a1a2e", color: "#fff" }}>
                  {opt}
                </option>
              ))}
            </select>
          </FilterSection>
        </div>
      )}

      {/* Active filter chips */}
      {!collapsed && hasFilters && (
        <div className="px-4 pb-3">
          <FilterChips />
        </div>
      )}
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-white/30 font-medium">{label}</p>
      {children}
    </div>
  );
}
