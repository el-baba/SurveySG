export type Sex = "All" | "Male" | "Female";

export type FilterState = {
  sex: Sex;
  ageMin: number;
  ageMax: number;
  ethnicity: string[];
  religion: string[];
  maritalStatus: string[];
  occupation: string[];
  region: string | null;
  planningArea: string | null;
  subzone: string | null;
};

export const DEFAULT_FILTERS: FilterState = {
  sex: "All",
  ageMin: 0,
  ageMax: 100,
  ethnicity: [],
  religion: [],
  maritalStatus: [],
  occupation: [],
  region: null,
  planningArea: null,
  subzone: null,
};

export const ETHNICITY_OPTIONS = ["Chinese", "Malay", "Indian", "Others"];
export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyFiltersToQuery(query: any, filters: FilterState) {
  if (filters.sex !== "All") query = query.eq("sex", filters.sex);
  if (filters.ageMin > 0) query = query.gte("age", filters.ageMin);
  if (filters.ageMax < 100) query = query.lte("age", filters.ageMax);
  if (filters.ethnicity.length > 0) query = query.in("ethnicity", filters.ethnicity);
  if (filters.religion.length > 0) query = query.in("religion", filters.religion);
  if (filters.maritalStatus.length > 0) query = query.in("marital_status", filters.maritalStatus);
  if (filters.occupation.length > 0) query = query.in("occupation", filters.occupation);
  if (filters.subzone) query = query.ilike("subzone", filters.subzone);
  else if (filters.planningArea) query = query.ilike("planning_area", filters.planningArea);
  return query;
}

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.sex !== "All") p.set("sex", filters.sex);
  if (filters.ageMin > 0) p.set("ageMin", String(filters.ageMin));
  if (filters.ageMax < 100) p.set("ageMax", String(filters.ageMax));
  if (filters.ethnicity.length) p.set("ethnicity", filters.ethnicity.join(","));
  if (filters.religion.length) p.set("religion", filters.religion.join(","));
  if (filters.maritalStatus.length) p.set("maritalStatus", filters.maritalStatus.join(","));
  if (filters.occupation.length) p.set("occupation", filters.occupation.join(","));
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
  const ethnicity = p.get("ethnicity");
  if (ethnicity) filters.ethnicity = ethnicity.split(",");
  const religion = p.get("religion");
  if (religion) filters.religion = religion.split(",");
  const maritalStatus = p.get("maritalStatus");
  if (maritalStatus) filters.maritalStatus = maritalStatus.split(",");
  const occupation = p.get("occupation");
  if (occupation) filters.occupation = occupation.split(",");
  const subzone = p.get("subzone");
  if (subzone) filters.subzone = subzone;
  const planningArea = p.get("planningArea");
  if (planningArea) filters.planningArea = planningArea;
  return filters;
}
