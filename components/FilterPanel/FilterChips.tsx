"use client";

import { X } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";

export function FilterChips() {
  const {
    sex, setSex,
    ageMin, ageMax, setAgeRange,
    ethnicity, setEthnicity,
    religion, setReligion,
    maritalStatus, setMaritalStatus,
    occupation, setOccupation,
    planningArea, setPlanningArea,
    subzone, setSubzone,
  } = useFilterStore();

  const chips: { label: string; onRemove: () => void }[] = [];

  if (sex !== "All") chips.push({ label: `Sex: ${sex}`, onRemove: () => setSex("All") });
  if (ageMin > 0 || ageMax < 100)
    chips.push({ label: `Age: ${ageMin}–${ageMax}`, onRemove: () => setAgeRange(0, 100) });
  ethnicity.forEach((e) =>
    chips.push({ label: e, onRemove: () => setEthnicity(ethnicity.filter((x) => x !== e)) })
  );
  religion.forEach((r) =>
    chips.push({ label: r, onRemove: () => setReligion(religion.filter((x) => x !== r)) })
  );
  maritalStatus.forEach((m) =>
    chips.push({ label: m, onRemove: () => setMaritalStatus(maritalStatus.filter((x) => x !== m)) })
  );
  occupation.forEach((o) =>
    chips.push({ label: `Job: ${o}`, onRemove: () => setOccupation(occupation.filter((x) => x !== o)) })
  );
  if (subzone) chips.push({ label: `Zone: ${subzone}`, onRemove: () => setSubzone(null) });
  else if (planningArea)
    chips.push({ label: `Area: ${planningArea}`, onRemove: () => setPlanningArea(null) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs border border-white/15"
        >
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-white transition-colors">
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  );
}
