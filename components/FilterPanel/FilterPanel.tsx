"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { ETHNICITY_OPTIONS, MARITAL_STATUS_OPTIONS, Sex } from "@/lib/filters";
import { AgeRangeSlider } from "./AgeRangeSlider";
import { MultiSelect } from "./MultiSelect";
import { FilterChips } from "./FilterChips";

export function FilterPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    sex, setSex,
    ageMin, ageMax, setAgeRange,
    ethnicity, setEthnicity,
    religion, setReligion,
    maritalStatus, setMaritalStatus,
    occupation, setOccupation,
    resetFilters,
  } = useFilterStore();

  const hasFilters =
    sex !== "All" ||
    ageMin > 0 ||
    ageMax < 100 ||
    ethnicity.length > 0 ||
    religion.length > 0 ||
    maritalStatus.length > 0 ||
    occupation.length > 0;

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
              {(["All", "Male", "Female"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                    sex === s
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {s}
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

          {/* Ethnicity */}
          <FilterSection label="Ethnicity">
            <div className="flex flex-wrap gap-1.5">
              {ETHNICITY_OPTIONS.map((eth) => (
                <button
                  key={eth}
                  onClick={() =>
                    setEthnicity(
                      ethnicity.includes(eth)
                        ? ethnicity.filter((e) => e !== eth)
                        : [...ethnicity, eth]
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    ethnicity.includes(eth)
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {eth}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Religion */}
          <FilterSection label="Religion">
            <MultiSelect
              options={[
                "Buddhist", "Christian", "Muslim", "Hindu", "Taoist",
                "No Religion", "Others",
              ]}
              selected={religion}
              onChange={setReligion}
              placeholder="Select religion..."
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

          {/* Occupation */}
          <FilterSection label="Occupation">
            <MultiSelect
              options={[]}
              selected={occupation}
              onChange={setOccupation}
              placeholder="Search occupation..."
              freeInput
            />
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
