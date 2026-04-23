import { create } from "zustand";
import { FilterState, DEFAULT_FILTERS, Sex } from "@/lib/filters";

export type PersonaAnswer = {
  personaId: string;
  name: string;
  age: number;
  sex: string;
  ethnicity: string;
  occupation: string;
  planningArea: string;
  answer: string;
};

type FilterStore = FilterState & {
  setSex: (sex: Sex) => void;
  setAgeRange: (min: number, max: number) => void;
  setEthnicity: (values: string[]) => void;
  setReligion: (values: string[]) => void;
  setMaritalStatus: (values: string[]) => void;
  setOccupation: (values: string[]) => void;
  setRegion: (region: string | null) => void;
  setPlanningArea: (area: string | null) => void;
  setSubzone: (subzone: string | null) => void;
  resetFilters: () => void;
  // Map state
  selectedArea: { name: string; type: "subzone" | "planningArea" } | null;
  setSelectedArea: (area: { name: string; type: "subzone" | "planningArea" } | null) => void;
  // Layer visibility
  showMRT: boolean;
  showHDB: boolean;
  showSchools: boolean;
  toggleMRT: () => void;
  toggleHDB: () => void;
  toggleSchools: () => void;
  // Persona answers panel
  personaAnswers: PersonaAnswer[];
  isLoadingAnswers: boolean;
  currentQuestion: string;
  showAnswersPanel: boolean;
  setPersonaAnswers: (answers: PersonaAnswer[]) => void;
  setIsLoadingAnswers: (loading: boolean) => void;
  setCurrentQuestion: (q: string) => void;
  setShowAnswersPanel: (show: boolean) => void;
  clearPersonaAnswers: () => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTERS,

  setSex: (sex) => set({ sex }),
  setAgeRange: (ageMin, ageMax) => set({ ageMin, ageMax }),
  setEthnicity: (ethnicity) => set({ ethnicity }),
  setReligion: (religion) => set({ religion }),
  setMaritalStatus: (maritalStatus) => set({ maritalStatus }),
  setOccupation: (occupation) => set({ occupation }),
  setRegion: (region) => set({ region, planningArea: null, subzone: null }),
  setPlanningArea: (planningArea) => set({ planningArea, subzone: null }),
  setSubzone: (subzone) => set({ subzone }),
  resetFilters: () => set({ ...DEFAULT_FILTERS, selectedArea: null }),

  selectedArea: null,
  setSelectedArea: (selectedArea) => set({ selectedArea }),

  showMRT: false,
  showHDB: false,
  showSchools: false,
  toggleMRT: () => set((s) => ({ showMRT: !s.showMRT })),
  toggleHDB: () => set((s) => ({ showHDB: !s.showHDB })),
  toggleSchools: () => set((s) => ({ showSchools: !s.showSchools })),

  personaAnswers: [],
  isLoadingAnswers: false,
  currentQuestion: "",
  showAnswersPanel: false,
  setPersonaAnswers: (personaAnswers) => set({ personaAnswers }),
  setIsLoadingAnswers: (isLoadingAnswers) => set({ isLoadingAnswers }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setShowAnswersPanel: (showAnswersPanel) => set({ showAnswersPanel }),
  clearPersonaAnswers: () =>
    set({ personaAnswers: [], showAnswersPanel: false, currentQuestion: "" }),
}));
