import { create } from "zustand";

interface UIState {
  hoveredFloorId: string | null;
  selectedFloorId: string | null;
  selectedCourseId: string | null;
  weekOffset: number;
  searchQuery: string;
  filterType: string;
  highlightedFloorId: string | null;

  setHoveredFloor: (id: string | null) => void;
  selectFloor: (id: string | null) => void;
  selectCourse: (id: string | null) => void;
  setWeekOffset: (fn: number | ((prev: number) => number)) => void;
  setSearchQuery: (q: string) => void;
  setFilterType: (t: string) => void;
  setHighlightedFloor: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  hoveredFloorId: null,
  selectedFloorId: null,
  selectedCourseId: null,
  weekOffset: 0,
  searchQuery: "",
  filterType: "all",
  highlightedFloorId: null,

  setHoveredFloor: (id) => set({ hoveredFloorId: id }),
  selectFloor: (id) => set({ selectedFloorId: id }),
  selectCourse: (id) => set({ selectedCourseId: id }),
  setWeekOffset: (fn) =>
    set((s) => ({ weekOffset: typeof fn === "function" ? (fn as (p: number) => number)(s.weekOffset) : fn })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterType: (t) => set({ filterType: t }),
  setHighlightedFloor: (id) => set({ highlightedFloorId: id }),
}));
