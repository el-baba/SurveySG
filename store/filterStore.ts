import { create } from "zustand";
import { FilterState, DEFAULT_FILTERS, Sex } from "@/lib/filters";

export type PersonaAnswer = {
  personaId: string;
  name: string;
  age: number;
  sex: string;
  planningArea: string;
  answer: string;
  sentiment: "positive" | "negative";
};

type FilterStore = FilterState & {
  setSex: (sex: Sex) => void;
  setAgeRange: (min: number, max: number) => void;
  setMaritalStatus: (values: string[]) => void;
  setEducationLevel: (values: string[]) => void;
  setRegion: (region: string | null) => void;
  setPlanningArea: (area: string | null) => void;
  setSubzone: (subzone: string | null) => void;
  resetFilters: () => void;
  // Map state
  selectedArea: { name: string; type: "subzone" | "planningArea" } | null;
  setSelectedArea: (area: { name: string; type: "subzone" | "planningArea" } | null) => void;
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
  // Summary (aggregate synthesis)
  summaryText: string;
  isSummaryLoading: boolean;
  setSummaryText: (t: string) => void;
  setIsSummaryLoading: (v: boolean) => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTERS,

  setSex: (sex) => set({ sex }),
  setAgeRange: (ageMin, ageMax) => set({ ageMin, ageMax }),
  setMaritalStatus: (maritalStatus) => set({ maritalStatus }),
  setEducationLevel: (educationLevel) => set({ educationLevel }),
  setRegion: (region) => set({ region, planningArea: null, subzone: null }),
  setPlanningArea: (planningArea) => set({ planningArea, subzone: null }),
  setSubzone: (subzone) => set({ subzone }),
  resetFilters: () => set({ ...DEFAULT_FILTERS, selectedArea: null }),

  selectedArea: null,
  setSelectedArea: (selectedArea) => set({ selectedArea }),

  personaAnswers: [],
  isLoadingAnswers: false,
  currentQuestion: "",
  showAnswersPanel: false,
  setPersonaAnswers: (personaAnswers) => set({ personaAnswers }),
  setIsLoadingAnswers: (isLoadingAnswers) => set({ isLoadingAnswers }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setShowAnswersPanel: (showAnswersPanel) => set({ showAnswersPanel }),
  clearPersonaAnswers: () =>
    set({ personaAnswers: [], showAnswersPanel: false, currentQuestion: "", summaryText: "", isSummaryLoading: false }),

  summaryText: "",
  isSummaryLoading: false,
  setSummaryText: (summaryText) => set({ summaryText }),
  setIsSummaryLoading: (isSummaryLoading) => set({ isSummaryLoading }),
}));
