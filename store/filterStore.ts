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

export type ChatMessage = {
  role: "user" | "persona";
  content: string;
  timestamp: number;
};

type ChatMode = "survey" | "persona";

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
  appendPersonaAnswers: (answers: PersonaAnswer[]) => void;
  setIsLoadingAnswers: (loading: boolean) => void;
  setCurrentQuestion: (q: string) => void;
  setShowAnswersPanel: (show: boolean) => void;
  clearPersonaAnswers: () => void;
  // Summary (aggregate synthesis)
  summaryText: string;
  isSummaryLoading: boolean;
  setSummaryText: (t: string) => void;
  setIsSummaryLoading: (v: boolean) => void;
  // Persona pin coordinates (personaId -> [lng, lat])
  personaCoordinates: Record<string, [number, number]>;
  setPersonaCoordinates: (coords: Record<string, [number, number]>) => void;
  // Focused persona (for map fly-to)
  focusedPersonaId: string | null;
  setFocusedPersonaId: (id: string | null) => void;
  // Selected persona (for pin highlight)
  selectedPersonaId: string | null;
  setSelectedPersonaId: (id: string | null) => void;
  // Incremented when the user deselects — tells the map to fly back to overview
  resetViewCounter: number;
  incrementResetView: () => void;
  // Private persona chat
  chatMode: ChatMode;
  privateChatPersona: PersonaAnswer | null;
  privateChatMessages: ChatMessage[];
  isPrivateChatLoading: boolean;
  streamingPersonaReply: string;
  startPrivateChat: (persona: PersonaAnswer) => void;
  endPrivateChat: () => void;
  appendPrivateChatMessage: (msg: ChatMessage) => void;
  setIsPrivateChatLoading: (v: boolean) => void;
  setStreamingPersonaReply: (v: string) => void;
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
  appendPersonaAnswers: (answers) => set((s) => ({ personaAnswers: [...s.personaAnswers, ...answers] })),
  setIsLoadingAnswers: (isLoadingAnswers) => set({ isLoadingAnswers }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setShowAnswersPanel: (showAnswersPanel) => set({ showAnswersPanel }),
  clearPersonaAnswers: () =>
    set({ personaAnswers: [], showAnswersPanel: false, currentQuestion: "", summaryText: "", isSummaryLoading: false, selectedPersonaId: null }),

  summaryText: "",
  isSummaryLoading: false,
  setSummaryText: (summaryText) => set({ summaryText }),
  setIsSummaryLoading: (isSummaryLoading) => set({ isSummaryLoading }),

  personaCoordinates: {},
  setPersonaCoordinates: (personaCoordinates) => set({ personaCoordinates }),
  focusedPersonaId: null,
  setFocusedPersonaId: (focusedPersonaId) => set({ focusedPersonaId }),
  selectedPersonaId: null,
  setSelectedPersonaId: (selectedPersonaId) => set({ selectedPersonaId }),
  resetViewCounter: 0,
  incrementResetView: () => set((s) => ({ resetViewCounter: s.resetViewCounter + 1 })),

  chatMode: "survey",
  privateChatPersona: null,
  privateChatMessages: [],
  isPrivateChatLoading: false,
  streamingPersonaReply: "",
  startPrivateChat: (persona) =>
    set({ chatMode: "persona", privateChatPersona: persona, privateChatMessages: [], streamingPersonaReply: "" }),
  endPrivateChat: () =>
    set({ chatMode: "survey", privateChatPersona: null, privateChatMessages: [], isPrivateChatLoading: false, streamingPersonaReply: "" }),
  appendPrivateChatMessage: (msg) => set((s) => ({ privateChatMessages: [...s.privateChatMessages, msg] })),
  setIsPrivateChatLoading: (isPrivateChatLoading) => set({ isPrivateChatLoading }),
  setStreamingPersonaReply: (streamingPersonaReply) => set({ streamingPersonaReply }),
}));
