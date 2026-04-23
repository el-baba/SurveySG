export type Sex = "All" | "Male" | "Female";

export type FilterState = {
  sex: Sex;
  ageMin: number;
  ageMax: number;
  maritalStatus: string[];
  educationLevel: string[];
  region: string | null;
  planningArea: string | null;
  subzone: string | null;
};

export const DEFAULT_FILTERS: FilterState = {
  sex: "All",
  ageMin: 0,
  ageMax: 100,
  maritalStatus: [],
  educationLevel: [],
  region: null,
  planningArea: null,
  subzone: null,
};

export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
export const EDUCATION_LEVEL_OPTIONS = [
  "No Qualification",
  "Primary",
  "Secondary",
  "Post-Secondary",
  "Diploma",
  "Degree",
  "Postgraduate",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyFiltersToQuery(query: any, filters: FilterState) {
  if (filters.sex !== "All") query = query.eq("sex", filters.sex);
  if (filters.ageMin > 0) query = query.gte("age", filters.ageMin);
  if (filters.ageMax < 100) query = query.lte("age", filters.ageMax);
  if (filters.maritalStatus.length > 0) query = query.in("marital_status", filters.maritalStatus);
  if (filters.educationLevel.length > 0) query = query.in("education_level", filters.educationLevel);
  if (filters.subzone) query = query.ilike("subzone", filters.subzone);
  else if (filters.planningArea) query = query.ilike("planning_area", filters.planningArea);
  return query;
}

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.sex !== "All") p.set("sex", filters.sex);
  if (filters.ageMin > 0) p.set("ageMin", String(filters.ageMin));
  if (filters.ageMax < 100) p.set("ageMax", String(filters.ageMax));
  if (filters.maritalStatus.length) p.set("maritalStatus", filters.maritalStatus.join(","));
  if (filters.educationLevel.length) p.set("educationLevel", filters.educationLevel.join(","));
  if (filters.subzone) p.set("subzone", filters.subzone);
  else if (filters.planningArea) p.set("planningArea", filters.planningArea);
  return p;
}

export function parseFiltersFromSearchParams(p: URLSearchParams): Partial<FilterState> {
  const filters: Partial<FilterState> = {};
  const sex = p.get("sex");
  if (sex) filters.sex = sex as Sex;
  const ageMin = p.get("ageMin");
  if (ageMin) filters.ageMin = Number(ageMin);
  const ageMax = p.get("ageMax");
  if (ageMax) filters.ageMax = Number(ageMax);
  const maritalStatus = p.get("maritalStatus");
  if (maritalStatus) filters.maritalStatus = maritalStatus.split(",");
  const educationLevel = p.get("educationLevel");
  if (educationLevel) filters.educationLevel = educationLevel.split(",");
  const subzone = p.get("subzone");
  if (subzone) filters.subzone = subzone;
  const planningArea = p.get("planningArea");
  if (planningArea) filters.planningArea = planningArea;
  return filters;
}
